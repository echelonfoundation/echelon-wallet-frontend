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
    createERC20Contract,
} from '../utils/backend';
import { getWalletEth, isMetamask } from '../utils/db';

export async function executeDeployERC20(name: string, symbol: string) {
    if (name === '' || symbol === '') {
        fireError('DeployERC20', 'Invalid amount!');
        return false;
    }

    let tx = await createERC20Contract(name, symbol);
    // let signed = await signTransaction(res.tx);
    // if (signed === null || signed === undefined) {
    //     return fireError('DeployERC20', 'Could not sign the message');
    // }
    // let result = await broadcast(
    //     signed.authBytes,
    //     signed.bodyBytes,
    //     signed.signature
    // );
    // if (result.res === true) {
    //     return fireSuccess(
    //         'DeployERC20',
    //         `Transaction sent with hash: ${result.msg}`
    //     );
    // }
    // return fireError(
    //     'DeployERC20',
    //     `Error sending the transaction: ${result.msg}`
    // );
    // let tx = await createERC20Transfer(getWalletEth(), dest, contract, amount);
    if (isMetamask()) {
        try {
            let res = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [tx.tx],
            });
            return fireSuccess(
                'Transfer',
                `Transaction sent with hash: ${res}`
            );
        } catch (e) {
            console.error(e);
            fireError('Transfer', 'Metamask error on submitting transaction');
        }
    } else {
        fireError(
            'Transfer',
            'ERC20 token transfers are only available on metamask!'
        );
        return false;
    }
}

const DeployERC20Card = () => {
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    return (
        <VStack p={10} alignItems="flex-start" border="1px" borderRadius={25}>
            <Heading size="md">ERC20 Contract</Heading>
            <Divider />
            <SimpleGrid columns={[1, 2]} columnGap={3} rowGap={6} w="full">
                <GridItem colSpan={[1, 2]}>
                    <FormControl id="destSendControl">
                        <FormLabel id="destSend">Name</FormLabel>
                        <Input
                            placeholder="Hanchon"
                            type="text"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </FormControl>
                </GridItem>
                <GridItem colSpan={[1, 2]}>
                    <FormControl id="amountSendControl">
                        <FormLabel id="amountSend">Symbol</FormLabel>
                        <Input
                            placeholder="HCH"
                            type="text"
                            onChange={(e) => setSymbol(e.target.value)}
                        ></Input>
                    </FormControl>
                </GridItem>

                <GridItem colSpan={[1, 2]} h="full">
                    <Center w="full">
                        <FormControl id="buttonSendControl">
                            <Button
                                w="full"
                                bg="teal.300"
                                color="white"
                                onClick={() => {
                                    executeDeployERC20(name, symbol);
                                }}
                            >
                                Deploy ERC20{' '}
                                <FiSend style={{ marginLeft: '5px' }} />
                            </Button>
                        </FormControl>
                    </Center>
                </GridItem>
            </SimpleGrid>
        </VStack>
    );
};

export default DeployERC20Card;