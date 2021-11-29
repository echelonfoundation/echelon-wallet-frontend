import { Button } from '@chakra-ui/button';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/input';
import {
    Box,
    Center,
    GridItem,
    Heading,
    SimpleGrid,
    VStack,
} from '@chakra-ui/layout';
import { Divider } from '@chakra-ui/react';
import { ethToEvmos } from '@hanchon/ethermint-address-converter';
import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { fireError, fireSuccess } from '../landing/alert';
import {
    signTransaction,
    callSendAphoton,
    broadcast,
    callProposalRegisterErc20,
    callConvertErc20,
    callConvertCoin,
} from '../utils/backend';
import { getWalletEth, getWalletEvmos } from '../utils/db';

export async function executeConvertCoin(
    denom: string,
    amount: string,
    // denom: string,
    fee: string,
    gasLimit: string
) {
    const myWallet = getWalletEvmos();
    if (myWallet === null) {
        fireError('Convert Coin', 'Invalid wallet!');
        return false;
    }
    const myWalletEth = getWalletEth();

    if (myWalletEth === null) {
        fireError('Convert Coin', 'Invalid wallet!');
        return false;
    }
    let walleta = myWallet;
    let walletb = myWallet;

    if (denom.split('intrarelayer-0x').length != 2) {
        walleta = myWalletEth;
    }

    if (Number(amount) === NaN) {
        fireError('Convert Coin', 'Invalid amount!');
        return false;
    }

    let res = await callConvertCoin(
        denom,
        amount,
        walleta,
        walletb,
        fee,
        gasLimit
    );

    let signed = await signTransaction(res);
    if (signed === null || signed === undefined) {
        return fireError('Convert Coin', 'Could not sign the message');
    }
    let result = await broadcast(
        signed.authBytes,
        signed.bodyBytes,
        signed.signature
    );
    if (result.res === true) {
        return fireSuccess(
            'Convert Coin',
            `Transaction sent with hash: ${result.msg}`
        );
    }
    return fireError(
        'Convert Coin',
        `Error sending the transaction: ${result.msg}`
    );
}

const ConvertCoin = () => {
    const [contract, setContract] = useState('');
    const [amount, setAmount] = useState('1');
    const [denom, setDenom] = useState('aphoton');
    const [fee, setFee] = useState('2');
    const [gasLimit, setGasLimit] = useState('2100000000000');
    return (
        <VStack p={10} alignItems="flex-start" border="1px" borderRadius={25}>
            <Heading size="md">Convert Coin</Heading>
            <Divider />
            <SimpleGrid columns={[1, 2]} columnGap={3} rowGap={6} w="full">
                <GridItem colSpan={[1, 2]}>
                    <FormControl id="destSendControl">
                        <FormLabel id="destSend">Denomination name</FormLabel>
                        <Input
                            placeholder="intrarelayer/0x.."
                            type="text"
                            onChange={(e) => setContract(e.target.value)}
                        />
                    </FormControl>
                </GridItem>

                <GridItem colSpan={[1, 2]}>
                    <FormControl id="amountSendControl">
                        <FormLabel id="amountSend">Amount</FormLabel>
                        <Input
                            value="1"
                            placeholder="1"
                            type="number"
                            onChange={(e) => setAmount(e.target.value)}
                        ></Input>
                    </FormControl>
                </GridItem>

                <GridItem colSpan={[1, 1]}>
                    <FormControl id="gascontrol">
                        <FormLabel id="gaslabel">Gas Limit</FormLabel>
                        <Input
                            placeholder="200000"
                            type="number"
                            onChange={(e) => setGasLimit(e.target.value)}
                        ></Input>
                    </FormControl>
                </GridItem>
                <GridItem colSpan={[1, 1]}>
                    <FormControl id="gaspricecontrol">
                        <FormLabel id="gaspricelabel">Fee</FormLabel>
                        <Input
                            value="20"
                            type="number"
                            onChange={(e) => setFee(e.target.value)}
                        ></Input>
                    </FormControl>
                </GridItem>

                <GridItem colSpan={[1, 2]} h="full">
                    <Center w="full">
                        <FormControl id="buttonRegisterERC20">
                            <Button
                                w="full"
                                bg="teal.300"
                                color="white"
                                onClick={() => {
                                    executeConvertCoin(
                                        contract,
                                        amount,
                                        // denom,
                                        fee,
                                        gasLimit
                                    );
                                }}
                            >
                                Convert Coins{' '}
                                <FiSend style={{ marginLeft: '5px' }} />
                            </Button>
                        </FormControl>
                    </Center>
                </GridItem>
            </SimpleGrid>
        </VStack>
    );
};

export default ConvertCoin;
