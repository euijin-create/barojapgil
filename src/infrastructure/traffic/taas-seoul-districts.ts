import "server-only";

export interface SeoulDistrict {
  name: string;
  guGunCode: string;
}

// TAAS guGun uses the final three digits of the official five-digit
// legal-dong city/county/district code. Keep this list explicit so a code
// change is reviewed rather than inferred at runtime.
export const SEOUL_DISTRICTS: readonly SeoulDistrict[] = [
  { name: "종로구", guGunCode: "110" },
  { name: "중구", guGunCode: "140" },
  { name: "용산구", guGunCode: "170" },
  { name: "성동구", guGunCode: "200" },
  { name: "광진구", guGunCode: "215" },
  { name: "동대문구", guGunCode: "230" },
  { name: "중랑구", guGunCode: "260" },
  { name: "성북구", guGunCode: "290" },
  { name: "강북구", guGunCode: "305" },
  { name: "도봉구", guGunCode: "320" },
  { name: "노원구", guGunCode: "350" },
  { name: "은평구", guGunCode: "380" },
  { name: "서대문구", guGunCode: "410" },
  { name: "마포구", guGunCode: "440" },
  { name: "양천구", guGunCode: "470" },
  { name: "강서구", guGunCode: "500" },
  { name: "구로구", guGunCode: "530" },
  { name: "금천구", guGunCode: "545" },
  { name: "영등포구", guGunCode: "560" },
  { name: "동작구", guGunCode: "590" },
  { name: "관악구", guGunCode: "620" },
  { name: "서초구", guGunCode: "650" },
  { name: "강남구", guGunCode: "680" },
  { name: "송파구", guGunCode: "710" },
  { name: "강동구", guGunCode: "740" },
] as const;
