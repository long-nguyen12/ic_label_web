import { API } from "@api";
import { convertSnakeCaseToCamelCase, renderMessageError } from "@app/common/functionCommons";
import axios from "axios";
import { getAllPaginationBase } from "../Base";
import { convertDigitIn } from "../../../utils/index";

export function getAll(query) {
  return axios
    .get(`${API.REPORT_QUERY}${query}`)
    .then((response) => {
      if (response.status === 200) return convertSnakeCaseToCamelCase(response?.data);
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}

export function exportReportQuery(currentPage = 1, totalDocs = 0, params) {
  let query = "";
  query += params.timeStart ? `&sale_date[from]=${convertDigitIn(params.timeStart)}` : "";
  query += params.timeEnd ? `&sale_date[to]=${convertDigitIn(params.timeEnd)}` : "";
  return axios
    .get(`${API.ALL_SALE_BILLS_EXPORT}?page=${currentPage}&limit=${totalDocs}${query}`, {
      loading: true,
      responseType: "blob",
    })
    .then((response) => {
      if (response.status === 200) return response?.data;
      return null;
    })
    .catch((err) => {
      renderMessageError(err);
      return null;
    });
}
