module xaro::xaro_token {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::url;
    use sui::event;
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::object::{Self, UID};
    use std::option;
    use std::string::{Self, String};

    /// The type identifier of coin. The coin will have a type
    /// tag of kind: `Coin<package_object::mycoin::MYCOIN>`
    /// Make sure that the name of the type matches the module's name.
    struct XARO_TOKEN has drop {}

    /// Capability allowing the bearer to mint and burn
    /// coins of type `XARO_TOKEN`. Transferable
    struct TokenCap has key, store {
        id: UID,
        treasury_cap: TreasuryCap<XARO_TOKEN>,
        total_supply: u64,
        owner: address,
    }

    /// Event emitted when tokens are transferred
    struct TransferEvent has copy, drop {
        code: String,
        from: address,
        to: address,
        amount: u64,
    }

    /// Event emitted when tokens are minted
    struct MintEvent has copy, drop {
        code: String,
        to: address,
        amount: u64,
    }

    /// Module initializer is called once on module publish.
    /// Here we create only the treasury cap and send it to the publisher,
    /// who then controls minting and burning of the coin.
    fun init(witness: XARO_TOKEN, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency<XARO_TOKEN>(
            witness, 
            6,                // decimals
            b"XARO",          // symbol
            b"XARO Token",    // name
            b"XARO token for the Sui blockchain ecosystem", // description
            option::some(url::new_unsafe_from_bytes(b"https://xaro.example.com/logo.png")), // icon url
            ctx
        );

        // Transfer the metadata to the sender so they can update it later if needed
        transfer::public_freeze_object(metadata);

        // Create the token capability object
        let token_cap = TokenCap {
            id: object::new(ctx),
            treasury_cap,
            total_supply: 0,
            owner: tx_context::sender(ctx),
        };

        // Transfer the capability to the sender
        transfer::public_transfer(token_cap, tx_context::sender(ctx));
    }

    /// Generate a 45-digit transaction code from transaction digest
    fun generate_transaction_code(ctx: &TxContext): String {
        let digest_bytes = tx_context::digest(ctx);
        let code_bytes = vector::empty<u8>();
        let i = 0;
        
        while (vector::length(&code_bytes) < 45) {
            let byte_index = i % vector::length(&digest_bytes);
            let byte_val = *vector::borrow(&digest_bytes, byte_index);
            let digit = (byte_val % 10) + 48; // Convert to ASCII digit
            vector::push_back(&mut code_bytes, digit);
            i = i + 1;
        };
        
        string::utf8(code_bytes)
    }

    /// Manager can mint new coins
    public entry fun mint(
        token_cap: &mut TokenCap, 
        amount: u64, 
        recipient: address, 
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == token_cap.owner, 0);
        
        let coin = coin::mint(&mut token_cap.treasury_cap, amount, ctx);
        token_cap.total_supply = token_cap.total_supply + amount;
        
        let code = generate_transaction_code(ctx);
        event::emit(MintEvent {
            code,
            to: recipient,
            amount,
        });
        
        transfer::public_transfer(coin, recipient);
    }

    /// Transfer tokens and emit event with unique code
    public entry fun transfer_tokens(
        coin: Coin<XARO_TOKEN>,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&coin);
        let sender = tx_context::sender(ctx);
        
        let code = generate_transaction_code(ctx);
        event::emit(TransferEvent {
            code,
            from: sender,
            to: recipient,
            amount,
        });
        
        transfer::public_transfer(coin, recipient);
    }

    /// Reward function for contributors
    public entry fun reward_for_fix(
        token_cap: &mut TokenCap,
        recipient: address,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == token_cap.owner, 0);
        
        let coin = coin::mint(&mut token_cap.treasury_cap, amount, ctx);
        token_cap.total_supply = token_cap.total_supply + amount;
        
        let code = generate_transaction_code(ctx);
        event::emit(TransferEvent {
            code,
            from: tx_context::sender(ctx),
            to: recipient,
            amount,
        });
        
        transfer::public_transfer(coin, recipient);
    }

    /// Get total supply
    public fun total_supply(token_cap: &TokenCap): u64 {
        token_cap.total_supply
    }

    /// Check if address is owner
    public fun is_owner(token_cap: &TokenCap, addr: address): bool {
        token_cap.owner == addr
    }

    /// Transfer ownership (only current owner can do this)
    public entry fun transfer_ownership(
        token_cap: &mut TokenCap,
        new_owner: address,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == token_cap.owner, 0);
        token_cap.owner = new_owner;
    }
}
