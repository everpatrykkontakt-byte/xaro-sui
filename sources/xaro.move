module xaro::xaro_token {
    use sui::tx_context::{TxContext, sender, digest};
    use sui::coin::{Self as Coin, Coin as CoinType, MintCap};
    use sui::token::{Self, Token};
    use sui::transfer;
    use sui::event;
    use std::string;
    use std::vector;

    struct Xaro has key, store {
        mint_cap: MintCap<Token>,
        total_supply: u64,
        owner: address,
        initial_price: u64,
    }

    struct TransferEvent has drop, store {
        code: string::String, // 45-cyfrowy kod transakcji
        from: address,
        to: address,
        amount: u64,
    }

    /// Generuje 45-cyfrowy kod na podstawie hash transakcji (tylko cyfry)
    fun generate_code(ctx: &TxContext): string::String {
        let h = digest(ctx); // 32 bajty
        let mut code = vector::empty<u8>();
        let mut i = 0;
        while (vector::length(&code) < 45) {
            let b = *vector::borrow(&h, i % vector::length(&h));
            let digit = b % 10;
            vector::push_back(&mut code, digit + 48); // 48 = '0'
            i = i + 1;
        }
        string::utf8(code)
    }

    /// Mintowanie tokenów (np. za fixing)
    public fun reward_for_fix(xaro: &mut Xaro, recipient: address, amount: u64, ctx: &mut TxContext) {
        assert!(sender(ctx) == xaro.owner, 1);
        Coin::mint(&xaro.mint_cap, amount, ctx);
        transfer::public_transfer(recipient, amount, ctx);
        let code = generate_code(ctx);
        event::emit(TransferEvent {
            code,
            from: sender(ctx),
            to: recipient,
            amount,
        });
    }

    /// Transfer tokenów XARO
    public fun transfer_tokens(xaro: &mut Xaro, to: address, amount: u64, ctx: &mut TxContext) {
        let code = generate_code(ctx);
        event::emit(TransferEvent {
            code,
            from: sender(ctx),
            to,
            amount,
        });
    }

    /// Mintowanie XARO na start/token sale
    public fun mint_to(xaro: &mut Xaro, to: address, amount: u64, ctx: &mut TxContext) {
        assert!(sender(ctx) == xaro.owner, 1);
        Coin::mint(&xaro.mint_cap, amount, ctx);
        transfer::public_transfer(to, amount, ctx);
        let code = generate_code(ctx);
        event::emit(TransferEvent {
            code,
            from: sender(ctx),
            to,
            amount,
        });
    }
}
