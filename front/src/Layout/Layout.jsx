import { Badge, Box, Flex, HStack, Img, Text, VStack } from '@chakra-ui/react'
import role from './role.png'
import React from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { parseJwt } from '../utils'
import { setToken } from '../store/store'
import { api } from '../store/api'

const Layout = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token)
  var user = null
  if (token !== null) {
    user = parseJwt(token)
  }
  const logout = () => {
    localStorage.removeItem('token')
    dispatch(setToken(null))
    dispatch(api.util.resetApiState())
    navigate('/')
  }

  const path = location.pathname
  return path !== '/' ? (
    <Box height={'100%'}>
      <Flex height={'100%'}>
        <Box color={'white'} background={'gray.800'} height={'100%'} flex={1}>
          {user && user.role === 'MASTER' ? (
            <HStack
              onClick={() => {
                navigate('/create')
              }}
              background={'purple.800'}
              p={4}
              cursor={'pointer'}
            >
              <Box>
                <i class="ri-add-circle-line"></i>
              </Box>
              <Box>Create</Box>
            </HStack>
          ) : null}
          {user && user.role === 'STUDENT' ? (
            <HStack
              background={'purple.800'}
              p={4}
              onClick={() => {
                navigate('/questions')
              }}
              cursor={'pointer'}
            >
              <Box>
                <i class="ri-question-line"></i>
              </Box>
              <Box>Questions</Box>
            </HStack>
          ) : null}
          {user ? (
            <HStack p={4} onClick={logout} cursor={'pointer'}>
              <Box>
                <i class="ri-login-box-line"></i>
              </Box>
              <Box>Logout</Box>
            </HStack>
          ) : null}
          <VStack
            borderRadius={10}
            m={5}
            mt={20}
            p={5}
            textAlign={'center'}
            background={'gray.700'}
          >
            <Img width={'50%'} src={role}></Img>
            <Text fontSize={'sm'}>{user ? user.email : ''}</Text>
            <Badge>{user ? user.role : ''}</Badge>
          </VStack>
        </Box>
        <Box flex={9}>{props.children}</Box>
      </Flex>
    </Box>
  ) : (
    props.children
  )
}

export default Layout
