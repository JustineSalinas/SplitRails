#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env,
    Symbol, Vec,
};

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Vendor,
    Token,
    Deadline,
    TotalRequired,
    TotalCleared,
    Participants,
    Status,
    Share(Address),
    Cleared(Address),
}

#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum Status {
    Open,
    Released,
    RolledBack,
}

#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[contracterror]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    UnknownParticipant = 3,
    InvalidAmount = 4,
    SharesDoNotSumToTotal = 5,
    AlreadyCleared = 6,
    NotOpen = 7,
    DeadlineNotReached = 8,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Opens an invoice: vendor, token (USDC SAC), deadline, and each
    /// participant's exact share. `total_required` must equal the sum of
    /// `shares` — a mismatch means the off-chain split has a rounding bug.
    pub fn init(
        env: Env,
        vendor: Address,
        token: Address,
        deadline: u64,
        total_required: i128,
        shares: Vec<(Address, i128)>,
    ) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Vendor) {
            return Err(Error::AlreadyInitialized);
        }

        let mut participants: Vec<Address> = Vec::new(&env);
        let mut sum: i128 = 0;
        for (participant, amount) in shares.iter() {
            if amount <= 0 {
                return Err(Error::InvalidAmount);
            }
            sum += amount;
            participants.push_back(participant.clone());
            env.storage()
                .instance()
                .set(&DataKey::Share(participant.clone()), &amount);
            env.storage()
                .instance()
                .set(&DataKey::Cleared(participant.clone()), &false);
        }
        if sum != total_required {
            return Err(Error::SharesDoNotSumToTotal);
        }

        env.storage().instance().set(&DataKey::Vendor, &vendor);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::Deadline, &deadline);
        env.storage()
            .instance()
            .set(&DataKey::TotalRequired, &total_required);
        env.storage().instance().set(&DataKey::TotalCleared, &0i128);
        env.storage()
            .instance()
            .set(&DataKey::Participants, &participants);
        env.storage()
            .instance()
            .set(&DataKey::Status, &Status::Open);

        Ok(())
    }

    /// A participant deposits their exact required share. Once every share
    /// is cleared this fires the release internally, in the same call.
    pub fn settle(env: Env, participant: Address) -> Result<(), Error> {
        participant.require_auth();

        if !env.storage().instance().has(&DataKey::Vendor) {
            return Err(Error::NotInitialized);
        }
        let status: Status = env.storage().instance().get(&DataKey::Status).unwrap();
        if status != Status::Open {
            return Err(Error::NotOpen);
        }

        let share_key = DataKey::Share(participant.clone());
        let amount: i128 = env
            .storage()
            .instance()
            .get(&share_key)
            .ok_or(Error::UnknownParticipant)?;

        let cleared_key = DataKey::Cleared(participant.clone());
        let already_cleared: bool = env.storage().instance().get(&cleared_key).unwrap();
        if already_cleared {
            return Err(Error::AlreadyCleared);
        }

        let token_address: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        token::Client::new(&env, &token_address).transfer(
            &participant,
            &env.current_contract_address(),
            &amount,
        );
        env.storage().instance().set(&cleared_key, &true);

        let total_cleared: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalCleared)
            .unwrap();
        let total_cleared = total_cleared + amount;
        env.storage()
            .instance()
            .set(&DataKey::TotalCleared, &total_cleared);
        env.events()
            .publish((symbol_short!("settled"),), participant.clone());

        let total_required: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalRequired)
            .unwrap();
        if total_cleared == total_required {
            release(&env);
        }

        Ok(())
    }

    /// Anyone may call this once the deadline has passed. Refunds every
    /// participant who had cleared their share.
    pub fn expire(env: Env) -> Result<(), Error> {
        if !env.storage().instance().has(&DataKey::Vendor) {
            return Err(Error::NotInitialized);
        }
        let status: Status = env.storage().instance().get(&DataKey::Status).unwrap();
        if status != Status::Open {
            return Err(Error::NotOpen);
        }
        let deadline: u64 = env.storage().instance().get(&DataKey::Deadline).unwrap();
        if env.ledger().timestamp() < deadline {
            return Err(Error::DeadlineNotReached);
        }

        let participants: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Participants)
            .unwrap();
        let token_address: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_address);

        for participant in participants.iter() {
            let cleared_key = DataKey::Cleared(participant.clone());
            let cleared: bool = env.storage().instance().get(&cleared_key).unwrap();
            if cleared {
                let amount: i128 = env
                    .storage()
                    .instance()
                    .get(&DataKey::Share(participant.clone()))
                    .unwrap();
                token_client.transfer(&env.current_contract_address(), &participant, &amount);
            }
        }

        env.storage()
            .instance()
            .set(&DataKey::Status, &Status::RolledBack);
        env.events()
            .publish((Symbol::new(&env, "rolledback"),), ());

        Ok(())
    }

    pub fn status(env: Env) -> Status {
        env.storage().instance().get(&DataKey::Status).unwrap()
    }

    pub fn get_share(env: Env, participant: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::Share(participant))
            .unwrap_or(0)
    }

    pub fn get_totals(env: Env) -> (i128, i128) {
        let cleared = env
            .storage()
            .instance()
            .get(&DataKey::TotalCleared)
            .unwrap_or(0);
        let required = env
            .storage()
            .instance()
            .get(&DataKey::TotalRequired)
            .unwrap_or(0);
        (cleared, required)
    }
}

/// Transfers the full aggregate to the vendor in one payout. Only ever
/// called internally by `settle`, once the last share clears — not a public
/// entrypoint.
fn release(env: &Env) {
    let vendor: Address = env.storage().instance().get(&DataKey::Vendor).unwrap();
    let token_address: Address = env.storage().instance().get(&DataKey::Token).unwrap();
    let total: i128 = env
        .storage()
        .instance()
        .get(&DataKey::TotalRequired)
        .unwrap();
    token::Client::new(env, &token_address).transfer(
        &env.current_contract_address(),
        &vendor,
        &total,
    );
    env.storage()
        .instance()
        .set(&DataKey::Status, &Status::Released);
    env.events().publish((symbol_short!("released"),), total);
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger};
    use soroban_sdk::token::{StellarAssetClient, TokenClient};

    fn create_token<'a>(
        env: &Env,
        admin: &Address,
    ) -> (Address, TokenClient<'a>, StellarAssetClient<'a>) {
        let sac = env.register_stellar_asset_contract_v2(admin.clone());
        let address = sac.address();
        (
            address.clone(),
            TokenClient::new(env, &address),
            StellarAssetClient::new(env, &address),
        )
    }

    struct Setup {
        env: Env,
        client_id: Address,
        vendor: Address,
        alice: Address,
        bob: Address,
        carol: Address,
        token: TokenClient<'static>,
    }

    fn setup_three_way_invoice() -> Setup {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(EscrowContract, ());
        let client = EscrowContractClient::new(&env, &contract_id);

        let vendor = Address::generate(&env);
        let admin = Address::generate(&env);
        let alice = Address::generate(&env);
        let bob = Address::generate(&env);
        let carol = Address::generate(&env);
        let (token_address, token, token_admin) = create_token(&env, &admin);
        token_admin.mint(&alice, &1_000);
        token_admin.mint(&bob, &1_000);
        token_admin.mint(&carol, &1_000);

        client.init(
            &vendor,
            &token_address,
            &1_000u64,
            &600i128,
            &Vec::from_array(
                &env,
                [
                    (alice.clone(), 100i128),
                    (bob.clone(), 200i128),
                    (carol.clone(), 300i128),
                ],
            ),
        );

        Setup {
            env,
            client_id: contract_id,
            vendor,
            alice,
            bob,
            carol,
            token,
        }
    }

    #[test]
    fn test_happy_path_all_settle_releases_to_vendor() {
        let s = setup_three_way_invoice();
        let client = EscrowContractClient::new(&s.env, &s.client_id);

        client.settle(&s.alice);
        client.settle(&s.bob);
        client.settle(&s.carol);

        assert_eq!(client.status(), Status::Released);
        assert_eq!(s.token.balance(&s.vendor), 600);
        assert_eq!(s.token.balance(&s.client_id), 0);
        assert_eq!(client.get_totals(), (600, 600));
    }

    #[test]
    fn test_expire_refunds_only_cleared_participants() {
        let s = setup_three_way_invoice();
        let client = EscrowContractClient::new(&s.env, &s.client_id);

        client.settle(&s.alice);
        client.settle(&s.bob);
        // carol never settles.

        s.env.ledger().set_timestamp(1_000);
        client.expire();

        assert_eq!(client.status(), Status::RolledBack);
        assert_eq!(s.token.balance(&s.alice), 1_000);
        assert_eq!(s.token.balance(&s.bob), 1_000);
        assert_eq!(s.token.balance(&s.carol), 1_000);
        assert_eq!(s.token.balance(&s.client_id), 0);
    }

    #[test]
    #[should_panic]
    fn test_double_settle_rejected() {
        let s = setup_three_way_invoice();
        let client = EscrowContractClient::new(&s.env, &s.client_id);

        client.settle(&s.alice);
        client.settle(&s.alice);
    }

    #[test]
    #[should_panic]
    fn test_unauthorized_settle_rejected() {
        let s = setup_three_way_invoice();
        let client = EscrowContractClient::new(&s.env, &s.client_id);
        let mallory = Address::generate(&s.env);

        client.settle(&mallory);
    }

    #[test]
    fn test_no_early_release() {
        let s = setup_three_way_invoice();
        let client = EscrowContractClient::new(&s.env, &s.client_id);

        client.settle(&s.alice);

        assert_eq!(client.status(), Status::Open);
        assert_eq!(s.token.balance(&s.vendor), 0);
    }

    #[test]
    #[should_panic]
    fn test_init_rejects_shares_not_summing_to_total() {
        let env = Env::default();
        let contract_id = env.register(EscrowContract, ());
        let client = EscrowContractClient::new(&env, &contract_id);

        let vendor = Address::generate(&env);
        let token = Address::generate(&env);
        let alice = Address::generate(&env);
        let bob = Address::generate(&env);

        client.init(
            &vendor,
            &token,
            &1_000u64,
            &999i128, // doesn't match 100 + 200
            &Vec::from_array(&env, [(alice.clone(), 100i128), (bob.clone(), 200i128)]),
        );
    }

    #[test]
    #[should_panic]
    fn test_init_twice_fails() {
        let env = Env::default();
        let contract_id = env.register(EscrowContract, ());
        let client = EscrowContractClient::new(&env, &contract_id);
        let vendor = Address::generate(&env);
        let token = Address::generate(&env);
        let alice = Address::generate(&env);

        let shares = Vec::from_array(&env, [(alice.clone(), 100i128)]);
        client.init(&vendor, &token, &1_000u64, &100i128, &shares);
        client.init(&vendor, &token, &1_000u64, &100i128, &shares);
    }

    #[test]
    #[should_panic]
    fn test_expire_rejects_before_deadline() {
        let s = setup_three_way_invoice();
        let client = EscrowContractClient::new(&s.env, &s.client_id);
        client.expire();
    }
}
