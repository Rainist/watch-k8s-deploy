# Listener

## Listen to http

### Parameter

```
"deployment": Deployment Name ex) 'heapster'
"namespace": Namespace Name ex) 'kube-system'
"how-long": Watch for X minutes (Max 60) ex) '5' means 5 minutes
"hear-at": Where to hear the result ex) 'http://your.sevice/listener/result[:80]'
```

### Response
```
200 # succesfully scheduled
404 # the deployment in the namespace is not found
500 # couldn't process
# and possibly other status code if appropriate
```

## What it does
- Simply publish to a kafka topic with necessary information so that watch can perform it's job
- check [Watcher](../watcher) for details