# Local demo application

Small Node.js service for local validation of the health and version contract. It is a demonstration component, not a production workload or a deployed AWS application.

```sh
cd application
npm test
docker build -t aws-ha-dr-demo:local .
docker run --rm -d --name aws-ha-dr-demo -p 3000:3000 aws-ha-dr-demo:local
curl -fsS http://localhost:3000/health
curl -fsS http://localhost:3000/version
docker stop aws-ha-dr-demo
```
