# Watcher

## Initialize
- consumes a topic message published by [Listener](../listener)

## Action
- watch deployment as described in a message from the topic

## Finalize
as publishing a topic message that either

- deletegate to [Teller](../teller) to send a message of success/failure
- re-register to the topic to re-check within timeout