How to renew SSL cert on Heroku
https://sikac.hu/use-let-s-encrypt-tls-certificate-on-heroku-65f853870d90#.miylv7it8

Useful commands:
dig www.landscape-connect.com cname +short
dscacheutil -flushcache
curl -vI https://www.landscape-connect.com

See the cert:
sudo cat /etc/letsencrypt/live/landscape-connect.com/fullchain.pem
sudo cat /etc/letsencrypt/live/landscape-connect.com/privkey.pem

Your cert will expire on 2016-10-09

To obtain a new or tweaked version of this certificate in the future, simply run letsencrypt-auto again