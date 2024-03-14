NODE_NAME="rbi1"
PORT=30306
AUTHRPC_PORT=8551
BOOTNODE=$(<nodes/bootnode)
ADDRESS="0x2B0F864146413Bd56f2cf7B1F64ABa904835453A"
 
echo $BOOTNODE
geth \
    --datadir ./nodes/node_$NODE_NAME \
    --port $PORT \
    --bootnodes $BOOTNODE \
    --networkid 123454321 \
    --authrpc.port $AUTHRPC_PORT \
    --unlock $ADDRESS \
    --password nodes/password \
    --mine \
    --miner.etherbase $ADDRESS \
    --allow-insecure-unlock \
    --http \
    --http.addr 'localhost' \
    --http.port 8545 \
    --http.api admin,eth,miner,net,txpool,personal,web3 \
    --ipcdisable \
    console
