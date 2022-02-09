# rockstar
A WIP Discord Bot that puts Speed & Reliability first.

---

### Table of Contents
[[_TOC_]]

## Structure
Rockstar is organized like a monorepo, so everything is divided into it's own subproject.


#### Chart
| Directory | Purpose |
| ---       | ---     |
| `gateway` | Recieving Discord Events and putting them through RabbitMQ to be fed to Clients |
| `client`  | Recieving Events through RabbitMQ and acting on them, like processing Commands, Members, etc. |
| `handler` | The Client Command Handler. Parses a Command's Prefix, Command, and Arguments. |
| `frontend` | The Website |

#### Flow
```mermaid
flowchart TD
    dg[Discord Gateway] --- |Event| s0 & s1 & s2 & s3
    da[Discord API];
    subgraph machine-1
    s2(Rockstar Gateway Shard 2)
    s3(Rockstar Gateway Shard 3)
    s2 & s3 --- |Event| rmq1{RabbitMQ}
    db1[(MariaDB)]
    re1[(Redis)]
    rmq1 --- cl3(Client) --> db1 & re1
    rmq1 --- cl4(Client) --> db1 & re1
    rmq1 --- cl5(Client) --> db1 & re1
    end
    subgraph machine-0
    s0(Rockstar Gateway Shard 0)
    s1(Rockstar Gateway Shard 1)
    s0 & s1 --> |Event| rmq0{RabbitMQ}
    rmq0 --> cl0(Client) --> db0 & re0
    rmq0 --> cl1(Client) --> db0 & re0
    rmq0 --> cl2(Client) --> db0 & re0
    db0[(MariaDB)]
    re0[(Redis)]
    end
    cl0 & cl1 & cl2 & cl3 & cl4 & cl5 -.-> da
    db0 <-.-> |replicate| db1
    re0 <-.-> |sync data| re1
```
