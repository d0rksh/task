import {
  Alert,
  Box,
  Button,
  Center,
  Flex,
  FormLabel,
  Heading,
  Img,
  Input,
  Select,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import React from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { api, useLoginMutation, useSignupMutation } from '../../store/api'
import { setToken } from '../../store/store'
import { parseJwt } from '../../utils'
import auth_logo from './auth.png'

function Auth() {
  const [auth, setAuth] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [role, setRole] = React.useState('MASTER')
  const [
    signup,
    {
      isLoading: sisLoading,
      isSuccess: signupSuccess,
      data: signupdata,
      error: signupError,
      reset,
    },
  ] = useSignupMutation()
  const [
    login,
    {
      isLoading: loginisLoading,
      isSuccess: loginSuccess,
      data: loginupdata,
      error: loginError,
      reset: sreset,
    },
  ] = useLoginMutation()
  const dispath = useDispatch()
  const navigate = useNavigate()

  const submit = () => {
    if (auth) {
      //login
      login({
        email,
        password,
      })
        .unwrap()
        .then((res) => {
          console.log(res)
          if (res.status === 'success') {
            const token = res.data
             localStorage.setItem('token', token)
             dispath(setToken(token))
            if (parseJwt(token).role === 'MASTER') {
                 navigate('/create')
            } else {
                 navigate('/questions')
            }
          }
        })
    } else {
      signup({
        email,
        password,
        role,
      })
    }
  }
  return (
    <Box height={'100%'}>
      <Flex height={'100%'}>
        <Box
          alignContent={'center'}
          alignItems={'center'}
          display={'flex'}
          flex={1}
        >
          <motion.img
            initial={{ translateY: 0 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            animate={{ translateY: -20 }}
            src={auth_logo}
          ></motion.img>
        </Box>
        <Flex
          p={20}
          flexDirection={'column'}
          justifyContent={'center'}
          height={'100%'}
          flex={1}
        >
          <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}>
            <Text
              as={'span'}
              position={'relative'}
              _after={{
                content: "''",
                width: 'full',
                height: useBreakpointValue({ base: '20%', md: '30%' }),
                position: 'absolute',
                bottom: 1,
                left: 0,
                bg: 'blue.400',
                zIndex: -1,
              }}
            >
              You tell, I do
            </Text>
            <br />{' '}
            <Text color={'blue.400'} as={'span'}>
              Project
            </Text>{' '}
          </Heading>
          <Heading mt={10}>
            {auth ? 'Welcome Back!!' : 'Signup for new account'}
          </Heading>
          <Text>
            {auth
              ? 'login below using your email and password'
              : 'create your free account below'}
          </Text>
          {signupError ? (
            <Alert status="error">{signupError.data.data}</Alert>
          ) : null}
          {signupSuccess && !sisLoading && signupdata ? (
            <Alert status="success">{signupdata.data}</Alert>
          ) : null}
          {loginError ? (
            <Alert status="error">{loginError.data.data}</Alert>
          ) : null}
          <FormLabel mt={5}>Email</FormLabel>
          <Input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
            }}
            placeholder="enter email address"
          ></Input>
          <FormLabel mt={2}>Password</FormLabel>
          <Input
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
            }}
            placeholder="enter your master"
            type={'password'}
          ></Input>

          {!auth
            ? [
                <FormLabel mt={2}>Role</FormLabel>,
                <Select
                  onChange={(e) => {
                    setRole(e.target.value)
                  }}
                >
                  <option value={'MASTER'}>Master/Teacher</option>
                  <option value={'STUDENT'}>Student</option>
                </Select>,
              ]
            : null}
          <Button
            onClick={submit}
            isLoading={loginisLoading || sisLoading}
            colorScheme={'green'}
            mt={4}
          >
            {auth ? 'Login' : 'Signup'}
          </Button>
          <Button
            onClick={() => {
              setAuth(!auth)
              reset()
              sreset()
            }}
            background={'gray.800'}
            color={'white'}
            _hover={{}}
            mt={4}
          >
            {auth ? 'create account' : 'Have account? click me to login'}
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

export default Auth
