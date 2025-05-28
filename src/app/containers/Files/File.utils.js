import {formatNumber} from '@src/utils';

function getAge(dateString) {
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function dateFormatterFromYYYYMMDD(dateString) {
  var year = dateString.substring(0, 4);
  var month = dateString.substring(5, 7);
  var day = dateString.substring(8, 10);
  return {
    day: day,
    month: month,
    year: year,
  };
}

export function getDataFile(data) {
  let dataPhieu = {
    hoten: data.userFullName,
    diachi: data.userAdd,
    time: data.time,
  };
  return data;
}

export function getDataSalebills(data) {
  let saleBillsDetaildown = []
  data.saleBillsDetail.forEach( (item,index) =>{
    item.index = index + 1;
    let moneyDc = parseInt(item.totalMoney) * parseInt(item.productDiscount) / 100
    item.productDiscountMoney =  formatNumber(moneyDc)
    item.totalMoney =  formatNumber(item.totalMoney)
    item.productPrice =  formatNumber(item.productPrice)
    item.productName =  item.productName
    item.totalMoneyAfterDiscount =  formatNumber(item.totalMoneyAfterDiscount)
    saleBillsDetaildown.push(item)
  })
  let dateBill = dateFormatterFromYYYYMMDD (data.saleBills?.saleDate)
  console.log(data,'data');
  let dataPhieu = {
    dayBill: dateBill.day,
    monthBill: dateBill.month,
    yearBill: dateBill.year,

    saleId: data.saleBills?.saleId,
    userName : data.userManager?.userFullName,
    userTaxCode  : data.userManager?.userTaxCode,
    userAdd  : data.userManager?.userAdd,
    userBankAccountNumber  : data.userManager?.userBankAccountNumber,
    useMobi : data.userManager?.userMobi,

    customerFullName: data.customer?.customerFullName,
    customerTaxCode: data.customer?.customerTaxCode ? data.customer?.customerTaxCode : '',
    customerMobi: data.customer?.customerMobi,
    customerAdd: data.customer?.customerAdd,
    customerBankAccountNumber: data.customer?.customerBankAccountNumber ? data.customer?.customerBankAccountNumber : '' ,

    saleBillsDetail: saleBillsDetaildown,
    saleTotalMoney: formatNumber(data.saleBills?.saleAllMoneyNotDiscount),
    saleTotalPayableAll: formatNumber(data.saleBills?.saleTotalPayableAll),
    saleDiscount: data.saleBills?.saleDiscount,
    saleTotalPayableADiscount: formatNumber(data.saleBills?.saleTotalPayableADiscount),

  };
  return dataPhieu;
}



