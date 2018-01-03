# Watch k8s deploy
> kubeless functions that watch k8s deployments status when requested

## Requirements
- k8s cluster
- [kubeless](http://kubeless.io) installed on the k8s cluster
- [kafka rest](https://docs.confluent.io/1.0/kafka-rest/docs/intro.html#installation)

## How it works

- **Listener** function will listen to requests via http and publish to a topic
- **Watcher** will consume the topic and check the status until either the deployment's status changed to done or timeout
- **Teller** tell the result to the requester

## How to use
TBD