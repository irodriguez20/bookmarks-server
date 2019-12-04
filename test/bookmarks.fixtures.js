function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'Test title 1',
            url: 'Test url 1',
            description: 'Test description 1.',
            rating: '4'
        },
        {
            id: 2,
            title: 'Test title 2',
            url: 'Test url 2',
            description: 'Test description 2.',
            rating: '5'
        },
        {
            id: 3,
            title: 'Test title 3',
            url: 'Test url 3',
            description: 'Test description 3.',
            rating: '3'
        },
        {
            id: 4,
            title: 'Test title 4',
            url: 'Test url 4',
            description: 'Test description 4.',
            rating: '2'
        },
    ];
}

module.exports = {
    makeBookmarksArray,
}