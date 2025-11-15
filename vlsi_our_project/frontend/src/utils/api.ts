import axios from 'axios'

const API_BASE_URL = '/api'

export const analyzeCode = async (code: string) => {
  const response = await axios.post(`${API_BASE_URL}/analyze`, { code })
  return response.data
}

export const debugCode = async (code: string, errorMessage: string = '') => {
  const response = await axios.post(`${API_BASE_URL}/debug`, { code, error_message: errorMessage })
  return response.data
}

export const optimizeCode = async (code: string, goals: string[] = ['performance', 'readability']) => {
  const response = await axios.post(`${API_BASE_URL}/optimize`, { code, goals })
  return response.data
}

export const simulateCode = async (code: string, testbench: string = '') => {
  const response = await axios.post(`${API_BASE_URL}/simulate`, { code, testbench })
  return response.data
}

export const explainConcept = async (code: string = '', concept: string = '') => {
  const response = await axios.post(`${API_BASE_URL}/explain`, { code, concept })
  return response.data
}

export const getTemplates = async () => {
  const response = await axios.get(`${API_BASE_URL}/templates`)
  return response.data
}
