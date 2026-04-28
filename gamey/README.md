# gamey

This folder contains the Rust implementation of the game engine for a 3D triangular board game with AI-powered bot opponents and conversational interactions.

## Features

### Game Engine
- **3D Triangular Board**: Full implementation of a triangular prism board system with 3D coordinate tracking (x, y, z axes)
- **Core Game Logic**: Complete game state management, player turns, moves, and game flow control
- **Movement System**: Comprehensive movement validation and coordinate-based action handling
- **Notation System**: YEN notation support for compact board state serialization, enabling efficient game state transmission and storage

### AI Bot System
The gamey package includes a sophisticated bot system with multiple difficulty levels:
- **Difficulty Levels**: Easy, Medium, Hard, and Random bot implementations for varied gameplay challenges
- **LLM Bot**: Integration with Large Language Models for advanced, context-aware bot behavior
- **Bot Registry**: Extensible bot system allowing registration and management of different bot strategies
- **Bot Server**: RESTful API server exposing bot functionality for chat-based interactions

### Bot Server & Chat Integration
- **Chat API**: `/v1/ybot/chat/{botId}` endpoint for getting bot responses in conversational gameplay
- **Game State Context**: Sends complete board layout and turn information to bots for informed decision-making
- **Message History**: Maintains conversation context between player and bot for coherent interactions
- **Configurable Difficulty**: Dynamic difficulty selection for bot responses

### Additional Capabilities
- **Benchmarking**: Built-in performance benchmarking with Criterion
- **Testing**: Comprehensive test suite with unit, integration, and fuzz tests
- **CLI Support**: Command-line interface for testing and running the game engine
- **Error Handling**: Robust error management with detailed error types

## Requirements 

In order to compile and run the code, it is necessary to have [cargo](https://doc.rust-lang.org/cargo/) which is part of [Rust](https://rust-lang.org/).

## Build

```sh
cargo build
```

For a release build with optimizations:

```sh
cargo build --release
```

## Run

```sh
cargo run
```

## Test

```sh
cargo test
```

## Benchmarks

Run the benchmarks using Criterion:

```sh
cargo bench
```

## Fuzz Testing

Run fuzz tests using cargo-fuzz (requires nightly Rust):

```sh
cargo install cargo-fuzz
cargo +nightly fuzz run fuzz_yen_deserialize
cargo +nightly fuzz run fuzz_coordinates
```

## Documentation

Generate and open the documentation:

```sh
cargo doc --open
```
