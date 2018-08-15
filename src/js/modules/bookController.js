var booksFormController = (function() {

    var bookForm = document.getElementById('book-form');
    var table = document.querySelector( '.books' );

    function createForm() {
        var $tmpl     = $('#temp').html(),
            $bookForm = $('#book-form'),
            html
        ;

        html = Mustache.to_html($tmpl);
        $bookForm.html(html).hide().fadeIn(1000);

    };

    function removeForm() {
        $('#book-form').children().fadeOut(500,function(){
            $(this).remove();
        });
    };



    bookForm.addEventListener('submit', function(e) {
        e.preventDefault();
        createBook();
    });


    function createBook() {
        var inputTitle           = bookForm.querySelector('.js-title'),
            inputDescription     = bookForm.querySelector('.js-description'),
            inputPanel           = bookForm.querySelector('.panel'),
            inputType            = bookForm.querySelectorAll('input[type="radio"]'),
            inputCheckbox        = bookForm.querySelectorAll('.genre-checkbox'),
            genreArr = [],
            genre, type, now, date, author
            ;

        author = usersData.getCurrentUser()[0].name;

        inputType.forEach(function(el) {
            if (el.checked) {
                type = el.value;
                return type;
            }
        });

        inputCheckbox.forEach(function(el) {
            if (el.checked) {
                genreArr.push(el.value);
            }

            return genreArr;
        });

        genre = genreArr.join(', ');

        if (inputTitle.value !== '' && inputDescription.value !== '' && genre !== '') {

            now = new Date();
            date = now.getHours() + ':' + (now.getMinutes().toString().length === 2 ? now.getMinutes() : '0' + now.getMinutes());

            var bookItem = {
                title: inputTitle.value,
                description: inputDescription.value,
                author: author,
                genre: genre,
                type: type,
                date: date
            };
            bookForm.reset();

            var newItem = booksData.addBookItem(bookItem);

            addBookToTable(newItem)
            inputTitle.classList.remove('border-success');
            inputDescription.classList.remove('border-success')
            hideAlert();
            $('.panel').off();
        } else {
            showAlert();
            validateForm(inputTitle, inputDescription)

        }
    };

    function formError(inputName) {
        if (inputName.value === '') {
            inputName.classList.add('border-danger');
            inputName.focus();
        }
        inputName.addEventListener('input', function() {
            if (inputName.value === '') {
            inputName.classList.remove('border-success');
            inputName.classList.add('border-danger');
          } else if (inputName.value !== '') {
            inputName.classList.remove('border-danger');
            inputName.classList.add('border-success');
          }
        });
    }

    function showAlert() {

        $('#requireAlert').show('fade');

    };

    function hideAlert() {
        $('#requireAlert').hide();
    };

    function validateForm(title, description) {
        checked = $(".genre-checkbox:checked").length

        if (checked === 0) {
            $('.invalid-feedback').addClass('d-block')
        }
        $('.panel').on('change', function(){
            checked = $(".genre-checkbox:checked").length
            if (checked > 0) {
                $('.invalid-feedback').removeClass('d-block')
            } else {
                $('.invalid-feedback').addClass('d-block')
            }
        });
        formError(description);
        formError(title);

    }

    function addBookToTable(obj) {
/*        var bookList = document.querySelector('.table-group'),
            tmpl = document.getElementById('comment-template').content.cloneNode(true);
        tmpl.querySelector('.id').innerText = obj.id;
        tmpl.querySelector('.title').innerText = obj.title;
        tmpl.querySelector('.description').innerText = obj.description;
        tmpl.querySelector('.author').innerText = obj.author;
        tmpl.querySelector('.date').innerText = obj.date;
        tmpl.querySelector('.genre').innerText = obj.genre;
        tmpl.querySelector('.type').innerText = obj.type;
        tmpl.querySelector('.js-delete-btn').addEventListener('click', deleteBookFromTable);
        bookList.appendChild(tmpl);*/


        var $bookList = $('.table-group'),
            $template = $bookList.find('#books-template').html(),
            data = {
            id          : obj.id,
            position    : obj.position,
            title       : obj.title,
            description : obj.description,
            author      : obj.author,
            date        : obj.date,
            genre       : obj.genre,
            type        : obj.type
        };

        $bookList.append(Mustache.render($template, data))
        $bookList.find('.js-delete-btn').on('click', deleteBookFromTable);

        updateBookPosition();
        mediator.publish('increaseCounter');
    };

    function updateBookPosition() {
        var $booksRow = $('.books-table').find('.table-book:not(:first-child)');
        $booksRow.each(function (index) {
            if ($(this).attr('data-position') != (index + 1)) {
                $(this).attr('data-position', (index + 1)).addClass('updated');
                $(this).find('.position').text(index + 1);
            }
        });
        booksData.localStorageNewPosition($booksRow);
    };

    function deleteBookFromTable(e) {
        if (e.target.classList.contains('js-delete-btn')) {
            e.target.parentElement.parentElement.remove();
            booksData.removeBookItem(e.target.parentElement.parentElement.querySelector('.id').textContent);
            updateBookPosition();
            mediator.publish('reduceCount');
        }
    };

    function showAllBooks() {
        removeAllBooks();
        var allBooks = booksData.getBookItems();

        function comparePos(posA, posB) {

            return posA.position - posB.position;
        }

        allBooks.sort(comparePos);

        allBooks.forEach(function(e) {
            addBookToTable(e);
        });

        updateBookPosition();

        mediator.publish('countAllBooks', allBooks);
    };

    function showPublicBooks(type) {
        removeAllBooks();

        var publicBooks = [],
            allBooks = booksData.getBookItems();

        function comparePos(posA, posB) {
            return posA.position - posB.position;
        }

        allBooks.sort(comparePos);

        allBooks.forEach(function(e) {
            if (e.type.toLowerCase() === 'public') {
                addBookToTable(e);
                publicBooks.push(e);
            }
        });
        removeDeleteBtns();
        updateBookPosition();
        mediator.publish('countPublicBooks', publicBooks);
    };

    function removeAllBooks() {
        var booksRow = document.querySelectorAll('.table-book');
        booksRow.forEach(function(e) {
            e.remove();
        });
        updateBookPosition();
    };

    function sortable() {
        $('.books-table').attr('id', 'sortable');
        var arr = [];
        $('#sortable').sortable({
            update: function (event, ui) {
                updateBookPosition();

                saveNewPosition();
            },
            disabled: false,

            change: function(event, ui) {
                ui.placeholder.css({
                    visibility: 'visible',
                    background: 'rgba(0,123,255,.25)',
                    height: '60px'
                });
            }
        });
    };

    function removeSortable() {
        $('#sortable').sortable({
            disabled: true
        });
    };

    function saveNewPosition() {
        var positions = [];
        $('.updated').each(function () {
            positions.push([$(this).rowIndex, $(this).attr('data-position')]);
            $(this).removeClass('updated');
        });
    };

    function removeDeleteBtns() {

        $('.js-delete-btn').remove();
    };

    mediator.subscribe('userOutSession', showPublicBooks);
    mediator.subscribe('userSession', [sortable, showAllBooks, createForm]);
    //mediator.subscribe('userSession', showAllBooks);

    mediator.subscribe('userLogIn', [showAllBooks, sortable, createForm]);

    mediator.subscribe('userLogOut', [showPublicBooks, removeSortable, hideAlert, removeForm]);

   // mediator.subscribe('userLogIn', sortable);

    //mediator.subscribe('userLogOut', removeSortable);

    //mediator.subscribe('userLogOut', hideAlert);
   // mediator.subscribe('userLogIn', createForm);
    //mediator.subscribe('userSession', createForm);
    //mediator.subscribe('userLogOut', removeForm);

})();
