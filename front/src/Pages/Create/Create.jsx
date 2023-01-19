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
  Alert,
} from '@chakra-ui/react'
import React from 'react'
import { useCreateQuestionMutation } from '../../store/api'

function Create() {
  const [left, setLeft] = React.useState('')
  const [right, setRight] = React.useState('')
  const [operator, setOperator] = React.useState('')
  const  [addQuestion,{isLoading,isSuccess,error,isError,data}] = useCreateQuestionMutation()
  const submit = ()=>{
    addQuestion({
      left: left,
      right: right,
      operator: operator,
    })
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
            <i style={{ color: 'white' }} class="ri-chat-1-line"></i>
          </Flex>
        </Box>
        Create Questions
      </Heading>
      <Box mt={5}>
         {isSuccess && data?<Alert>{data.data}</Alert>:null}
      </Box>
      <Grid gridGap={5} mt={5} gridTemplateColumns={'1fr 1fr 1fr'}>
        <GridItem>
          <Select   onChange={(e) => {
              setLeft(e.target.value)
            }}>
            <option selected disabled>
              select left operand
            </option>
            <option value={'zero'}>0</option>
            <option value={'one'}>1</option>
            <option value={'two'}>2</option>
            <option value={'three'}>3</option>
            <option value={'four'}>4</option>
            <option value={'five'}>5</option>
            <option value={'six'}>6</option>
            <option value={'seven'}>7</option>
            <option value={'eight'}>8</option>
            <option value={'nine'}>9</option>

          </Select>
        </GridItem>
        <GridItem>
          <Select   onChange={(e) => {
              setOperator(e.target.value)
            }}>
            <option selected disabled>
              select operator
            </option>
            <option value={'add'}>Add</option>
            <option value={'times'}>Times</option>
            <option value={'minus'}>Minus</option>
            <option value={'divide'}>Divide</option>
          </Select>
        </GridItem>
        <GridItem>
          <Select
            onChange={(e) => {
              setRight(e.target.value)
            }}
          >
            <option selected disabled>
              select right operand
            </option>
            <option value={'zero'}>0</option>
            <option value={'one'}>1</option>
            <option value={'two'}>2</option>
            <option value={'three'}>3</option>
            <option value={'four'}>4</option>
            <option value={'five'}>5</option>
            <option value={'six'}>6</option>
            <option value={'seven'}>7</option>
            <option value={'eight'}>8</option>
            <option value={'nine'}>9</option>

          </Select>
        </GridItem>
      </Grid>
      <Card mt={5}>
        <Heading p={5}>{left}({operator}({right}())) = ?</Heading>
      </Card>
      <Button onClick={submit} isLoading={isLoading} colorScheme={'purple'} mt={5}>
        Submit question
      </Button>
    </Box>
  )
}

export default Create
