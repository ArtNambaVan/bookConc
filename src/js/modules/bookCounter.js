var bookCounter = (function() {
    var counter = document.querySelector('.js-count');
    var count = 0;

    function publicBooksCounter(books) {
        count = books.length;
        counter.textContent = count;
        return count;
    };

    function allBooksCounter(books) {
        count = books.length;
        counter.textContent = count;
        return count;
    };

    function increaseCounter() {
        count ++;
        counter.textContent = count;
        return count;
    };

    function reduceCount() {
        count--;
        counter.textContent = count;
        return count;
    };



    mediator.subscribe('countPublicBooks', publicBooksCounter);
    mediator.subscribe('countAllBooks', allBooksCounter);
    mediator.subscribe('increaseCounter', increaseCounter);
    mediator.subscribe('reduceCount', reduceCount);


})();
