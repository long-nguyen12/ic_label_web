import { API } from "@api";
import { createBase, deleteByIdBase, getAllBase, updateBase } from "../Base";

export function createAnhDuocGan(data) {
  return createBase(API.ANH_DUOC_GAN, data);
}

export function createAnhTheoDonVi(id, data) {
  return createBase(API.ANH_THEO_DON_VI.format(id), data);
}
