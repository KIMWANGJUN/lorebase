
// src/lib/validationRules.ts

export const validateUsername = (username: string): string | null => {
  if (!username) return "아이디를 입력해주세요.";
  if (username.length < 5 || username.length > 20) {
    return "아이디는 5~20자 이내로 설정해야 합니다.";
  }
  if (!/^[a-z]/.test(username)) {
    return "첫 글자는 반드시 영문 소문자여야 합니다.";
  }
  if (!/[a-z]/.test(username)) {
    return "영문 소문자가 필수로 포함되어야 합니다.";
  }
  if (!/^[a-z0-9_-]+$/.test(username)) {
    return "아이디는 영문 소문자, 숫자, 특수문자(-, _)만 사용 가능합니다.";
  }
  if (/^[0-9]+$/.test(username)) {
    return "아이디는 숫자만으로 구성될 수 없습니다.";
  }
  const numDigits = (username.match(/\d/g) || []).length;
  if (numDigits >= 8) {
    return "아이디에 포함된 숫자는 8개 미만이어야 합니다.";
  }
  if (/^([a-z])\1+$/.test(username) && username.length >= 5) {
    return "아이디가 하나의 영문자로만 반복될 수 없습니다.";
  }
  const forbiddenUsernames = ["wangjunland", "admin", "webmaster"];
  if (forbiddenUsernames.includes(username.toLowerCase())) {
    return "사용할 수 없는 아이디입니다.";
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "비밀번호를 입력해주세요.";
  if (password.length < 8 || password.length > 16) {
    return "비밀번호는 8~16자 이내로 설정해야 합니다.";
  }
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  let missingConditions = [];
  if (!hasUpperCase) missingConditions.push("영문 대문자");
  if (!hasLowerCase) missingConditions.push("영문 소문자");
  if (!hasNumber) missingConditions.push("숫자");
  if (!hasSpecialChar) missingConditions.push("특수문자");

  if (missingConditions.length > 0) {
    return `비밀번호는 ${missingConditions.join(', ')}를 포함해야 합니다.`;
  }
  return null;
};

export const validateNickname = (nickname: string): string | null => {
  if (!nickname) return "닉네임을 입력해주세요.";
  if (nickname.length < 2 || nickname.length > 14) {
    return "닉네임은 2~14자 사이로 설정해야 합니다.";
  }
  if (!/^[a-zA-Z0-9가-힣]+$/.test(nickname)) {
    return "닉네임은 한글, 영문, 숫자만 사용 가능하며 공백 및 특수문자는 사용할 수 없습니다.";
  }
  // 욕설, 비방 등 필터링은 서버 측에서 더 정교하게 처리하는 것이 일반적입니다.
  // 여기서는 기본적인 문자 규칙만 검사합니다.
  return null;
};
