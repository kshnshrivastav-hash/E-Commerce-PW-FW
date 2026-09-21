export interface User {
    username: string;
    password: string;
}

export const users : Record<string,User> = {
    standard: { username: 'standard_user', password: 'secret_sauce' },
    lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
    invalidPassword: { username: 'standard_user', password: 'wrong_password' },
    invalidUsername: { username: 'wrong_user', password: 'secret_sauce' },
    empty: { username: '', password: '' },
};
