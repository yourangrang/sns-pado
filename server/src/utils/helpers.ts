// 랜덤 identifier 생성
export function makeId(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// 한글 + 영어 + 숫자 안전하게 slug 생성
export const slugify = (str: string) => {
    if (!str) return '';

    str = str.trim().toLowerCase();

    // 유럽 악센트 제거 (기존)
    const from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
    const to   = "aaaaaeeeeeiiiiooooouuuunc------";
    for (let i = 0; i < from.length; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    // 특수문자 제거, 공백 -> 대시, 한글 허용
    str = str.replace(/[^\p{L}\p{N}\s-]/gu, '') // 모든 문자와 숫자 + 공백/대시 허용
             .replace(/\s+/g, '-')             // 공백 → 대시
             .replace(/-+/g, '-');             // 연속 대시 하나로

    return str;
};
