import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080',
    prepareHeaders: (header, {getState}) => {
      const state = getState()
      const token = state.auth.token
      if (token) {
        header.set('Authorization', 'Bearer ' + token)
      }
      return header
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (args) => ({ url: '/login', method: 'POST', body: args }),
    }),
    signup: builder.mutation({
      query: (args) => ({ url: '/signup', method: 'POST', body: args }),
    }),
    createQuestion: builder.mutation({
      query: (args) => ({ url: '/create-question', method: 'POST', body: args }),
    }),
    questions: builder.query({
        query: (args) => ({ url: '/questions'}),
        providesTags:(result,error,args)=>{
            return [{type:'questions'}]
        }
      }),
    createAnswer: builder.mutation({
        query: (args) => ({ url: '/answer-question', method: 'POST', body: args }),
        invalidatesTags:(result,error,args)=>{
            return [{type:'questions'}]
        }
      }),
  }),
})

export const { useLoginMutation, useSignupMutation,useCreateQuestionMutation,useQuestionsQuery,useCreateAnswerMutation } = api
