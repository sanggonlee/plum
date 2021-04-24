import axios from "axios";
import { Table } from "types";

const SERVER_HTTP_BASE_URL = process.env.REACT_APP_HTTP_SERVER_ORIGIN;

export async function getTables() {
  const resp = await axios.get<Table[]>(`${SERVER_HTTP_BASE_URL}/user_tables`);
  const { data } = resp;
  return data;
}

export async function uploadTimeseriesFile(formData: FormData) {
  const resp = await axios.post(
    `${SERVER_HTTP_BASE_URL}/timeseries/upload`,
    formData
  );
  const { data } = resp;
  return data;
}

export function getTimeseriesDownloadFileUrl(filename: string): string {
  return `${SERVER_HTTP_BASE_URL}/timeseries/download/${filename}.jsonl`;
}
