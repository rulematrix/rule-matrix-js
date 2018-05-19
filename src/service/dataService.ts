import axios from 'axios';
import { ModelBase, PlainData, DataType, SurrogateDataType } from '../models';
import { DataTypeX, Stream, BasicData } from '../models/data';
import { nBins } from '../config';

const rootUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : location.origin;
const api = `${rootUrl}/api`;

type Filter = number[] | null;

function getOrPost<T>(url: string, params?: any, data?: any): Promise<T> {
  if (!data) {
    const config = params ? {params} : undefined;
    return axios
      .get(url, config)
      .then(response => {
        // console.log(response);  // tslint:disable-line
        if (response.status === 200) return response.data;
        throw response;
      })
      .catch(error => {
        console.warn(error);
      });
  } else {
    return axios
      .post(url, data, { params })
      .then(response => {
        if (response.status === 200) return response.data;
        throw response;
      })
      .catch(error => {
        console.log(error);  // tslint:disable-line
      });
  }
}

interface Cache<T> {
  count: number;
  data: T;
}

// type PromiseFunction<T> = (...a: any[]) => Promise<T>;
const cache: {[key: string]: Cache<any>} = {};

function memorizedGetOrPost<T>(
  url: string, params?: any, json?: any
): Promise<T> {
  const key = [url, params, json].map((e) => JSON.stringify(e)).join(',');
  if (key in cache)
    return Promise.resolve<T>(cache[key].data);
  else
    return getOrPost<T>(url, params, json).then((data) => {
      cache[key] = {data, count: 0};
      return data;
    });
}

function getModelList(): Promise<ModelBase> {
  const url = `${api}/model`;
  return getOrPost(url);
}

function getModel(model: string): Promise<ModelBase> {
  const url = `${api}/model/${model}`;
  return getOrPost(url);
}

function getModelData(
  modelName: string, 
  data: DataType | SurrogateDataType = 'train',
  filters: Filter[] | null = null,
): Promise<PlainData> {
  const url = `${api}/model_data/${modelName}`;
  const params = {data, bins: nBins};
  const json = filters && (filters.length ? filters : null);
  return memorizedGetOrPost(url, params, json);
}

function getFilterData(
  modelName: string, 
  data: DataType | SurrogateDataType = 'train',
  filters: Filter[] | null = null,
  start: number = 0,
  end: number = 50,
): Promise<BasicData> {
  // if (filters === null) return getModelData(modelName, data);
  const url = `${api}/query/${modelName}`;
  const params = {data, bins: nBins, start, end};
  // const post = {filters, start, end};
  const json = filters && (filters.length ? filters : null);
  return memorizedGetOrPost(url, params, json);
}

function getStream(
  modelName: string, data: DataTypeX = 'train', conditional: boolean = false,
  filters: Filter[] | null = null,
): Promise<Stream[] | Stream[][]> {
  const url = `${api}/stream/${modelName}`;
  const params = {data, conditional, bins: nBins};
  const json = filters && (filters.length ? filters : null);
  return memorizedGetOrPost(url, params, json);
}

function getSupport(
  modelName: string, data: DataTypeX = 'train',
  filters: Filter[] | null = null,
): Promise<number[][]> {
  const url = `${api}/support/${modelName}`;
  const params = {data};
  const json = filters && (filters.length ? filters : null);
  return memorizedGetOrPost(url, params, json);
}

function getSupportMat(
  modelName: string, data: DataTypeX = 'train', filters: Filter[] | null = null
): Promise<number[][][]> {
  const url = `${api}/support/${modelName}`;
  const params = {data, support: 'mat'};
  const json = filters && (filters.length ? filters : null);
  return memorizedGetOrPost(url, params, json);
}

export default {
  getModelList,
  getModel,
  // getData,
  getModelData,
  getFilterData,
  getSupport,
  getSupportMat,
  getStream,
};
