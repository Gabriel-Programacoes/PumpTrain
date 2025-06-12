export interface User {
    id: number;
    name: string;
    email: string;
    age: number | null;
    height: number | null;
    weight: number | null;
    avatarKey?: string | null;
}