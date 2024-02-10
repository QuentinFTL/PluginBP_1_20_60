export default [
    {
        name: "SuperAdmin",
        permissions: [
            "Admin",
            "Moderator",
            "VIP+",
            "VIP",
            "Player"
        ]
    },
    {
        name: "Admin",
        permissions: [
            "Moderator",
            "VIP+",
            "VIP",
            "Player"
        ]
    },
    {
        name: "Moderator",
        permissions: [
            "VIP+",
            "VIP",
            "Player"
        ]
    },
    {
        name: "VIP+",
    },
    {
        name: "VIP",
    },
    {
        name: "Player",
    }
];