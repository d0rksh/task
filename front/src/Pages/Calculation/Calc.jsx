import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  GridItem,
  Heading,
  Select,
  Grid,
  Card,
  Button,
  Spacer,
  Badge,
  Input,
  Text,
  useBreakpointValue,
  HStack,
  CircularProgress
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { api, useCreateAnswerMutation, useQuestionsQuery } from '../../store/api'

function Question() {
  const {data,isLoading,error} = useQuestionsQuery()
  const dispatch = useDispatch()
  const getScore = ()=>{
     if(isLoading || error){
       return '0/0'
     }else{
        const length = data.data.length
        var score = 0
        data.data.forEach((a)=>{
            if(a.status === 'CORRECT'){
              score = score + 1
            }
        })
        return `${score}/${length}`
     }
  }
  return (
    <Box p={5}>
      <Heading mt={5} size={'sm'}>
        <Box mr={2} display={'inline-block'}>
          <Flex
            borderRadius={10}
            padding={'3'}
            alignItems={'center'}
            justifyContent="center"
            boxShadow={'4px 5px rgba(142, 39, 245, 0.19)'}
            background={'purple.500'}
          >
            <i style={{ color: 'white' }} class="ri-question-mark"></i>
          </Flex>
        </Box>
        Questions By Teacher
      </Heading>

      <Box mt={5}>

      <HStack onClick={()=>{
          dispatch(api.util.invalidateTags([{'type':'questions'}]))
      }} cursor={'pointer'}>
        <Box><i class="ri-restart-line"></i></Box>
        <Box>Refresh</Box>
      </HStack>
        {isLoading ? <CircularProgress isIndeterminate></CircularProgress>:null}
        {!isLoading && data ? data.data.map((item, index) => {
          return <SQuestion q={item} key={index} id={index}></SQuestion>
        }):null}
        <Card color={'white'} background={'gray.800'} p={5} mt={5}>
            <Heading><Box><i class="ri-gift-line"></i></Box> Score: {getScore()}</Heading>
        </Card>
      </Box>
    </Box>
  )
}

const SQuestion = (props)=>{
  const [submitAnswer,{data}] = useCreateAnswerMutation()
  const [ans,setAns] = useState(null)
  const submit = ()=>{
      if(ans !== null){
        submitAnswer({
          question_id:props.q.id,
          answer:ans
         })
      }
  }
   return (
    <Box mt={2} p={4} border={'1px solid #e1e1e1'}>
    <Heading size={'md'} mb={3}>{props.q.question} ? =</Heading>
      <Grid gridTemplateColumns={'1fr 1fr 1fr'}>
      <GridItem><Badge colorScheme={props.q.status === 'CORRECT'?'green':'red'}>{props.q.status}</Badge></GridItem>
        <GridItem> <Input value={ans} onChange={(e)=>{
            setAns(e.target.value)
        }}  ml={5} disabled={props.q.status !== 'NOT ANSWERED'} width={'15%'} placeholder={'0'} type={'number'}></Input></GridItem>
        <GridItem> <Button disabled={props.q.status !== 'NOT ANSWERED'} onClick={submit} colorScheme={'purple'} ml={5}>Submit answer</Button></GridItem>
      </Grid>
    </Box>
   )
}

export default Question
