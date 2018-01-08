.PHONY: u-listener u-watcher u-teller update ping

update: u-listener u-watcher u-teller

u-listener: 
	cd functions/listener && bin/update.sh   

u-teller: 
	cd functions/teller && bin/update.sh   

u-watcher: 
	cd functions/watcher && bin/update.sh   

ping:
	kubeless function ls --namespace kubeless

