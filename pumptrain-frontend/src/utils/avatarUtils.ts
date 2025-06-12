export const PREDEFINED_AVATARS = [
    { key: 'avatar1', name: 'Avatar 1', path: '/assets/avatars/avatar1.jpg' },
    { key: 'avatar2', name: 'Avatar 2', path: '/assets/avatars/avatar2.jpg' },
    { key: 'avatar3', name: 'Avatar 3', path: '/assets/avatars/avatar3.jpg' },
    { key: 'avatar4', name: 'Avatar 4', path: '/assets/avatars/avatar4.jpg' },
    { key: 'avatar5', name: 'Avatar 5', path: '/assets/avatars/avatar5.jpg' },
    { key: 'avatar6', name: 'Avatar 6', path: '/assets/avatars/avatar6.jpg' },
    { key: 'avatar7', name: 'Avatar 7', path: '/assets/avatars/avatar7.jpg' },
    { key: 'avatar8', name: 'Avatar 8', path: '/assets/avatars/avatar8.jpg' },
    { key: 'avatar9', name: 'Avatar 9', path: '/assets/avatars/avatar9.jpg' },
    { key: 'avatar10', name: 'Avatar 10', path: '/assets/avatars/avatar10.jpg' },
]

export const getAvatarPath = (key?: string | null): string | undefined => {
    if (!key) return undefined;
    const avatar = PREDEFINED_AVATARS.find(a => a.key === key);
    return avatar?.path;
}