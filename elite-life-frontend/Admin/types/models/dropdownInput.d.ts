export interface InputValue {
    name: string;
    code: string | number;
}

export interface InputValueAdvanced {
    name: string;
    code: string | number;
    extraValue: string | number;
    extraOrgPolicyRankId: string | number;
}
export interface InputValueResponse {
    Extra?: any;
    Text: string;
    Value: string | number;
}