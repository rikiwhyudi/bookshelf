
const search = document.querySelector('#searchBar');
const modal = document.getElementById("myModal");
const btn = document.getElementById("myBtn");
const span = document.getElementsByClassName("close")[0];

search.addEventListener('keyup', searchBar);
function searchBar(booksId) {
  const searchList = booksId.target.value.toLowerCase();
  const itemList = document.querySelectorAll('.item');

  itemList.forEach(item => {
    const listItem = item.firstChild.textContent.toLowerCase();

    if (listItem.indexOf(searchList) !== -1) {
      item.setAttribute('style', 'display: flex;')
    } else {
      item.setAttribute('style', 'display: none;')
    }
  });
}

btn.onclick = function() {
  modal.style.display = "block";
}

span.onclick = function() {
  modal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

const bookShelf = [];
const RENDER_EVENT = 'render_apps';

document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBooks();
    });
    if (isStorageExist()) {
        loadDataFromLocalStorage();
    }
});

function addBooks() {
    const chk = confirm('Tambahkan buku ini..?');

    if (chk) {
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const date = document.getElementById('date').value;
        const status = document.getElementById('checkbox').checked;
        const generateID = +new Date();
        const bookApps = generateBooks(generateID, title, author, date, status);
        bookShelf.push(bookApps);
    
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();

        alert(`
        Judul: ${title}
        Penulis: ${author}
        Tahun: ${date}
        Telah berhasil ditambahkan...`
        );
    }
}

function generateBooks(id, title, author, date, isCompleted) {
    return {
        id,
        title,
        author,
        date,
        isCompleted
    }
}


document.addEventListener(RENDER_EVENT, function() {
    const unComplitedList = document.getElementById('e-books');
    unComplitedList.innerHTML = '';

    const completedList = document.getElementById('completed-todos');
    completedList.innerHTML = '';
 
    for (const item of bookShelf) {
        const creates = booksCreate(item);
        if (!item.isCompleted) {
            unComplitedList.append(creates);
        } else {
            completedList.append(creates);
        }
    }
});

function booksCreate(bookApps) {
    const title = document.createElement('h2');
    title.innerText = bookApps.title;
    const author = document.createElement('h3');
    author.innerText = bookApps.author;
    const date = document.createElement('p');
    date.innerText = bookApps.date;
    const textContainer = document.createElement('div');
    textContainer.append(title, author, date);
    const container = document.createElement('div');
    container.classList.add('item');
    container.append(textContainer);
    container.setAttribute('id', `todo-${bookApps.id}`);
    
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');

    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    checkButton.addEventListener('click', function() {
        booksCompleted(bookApps.id);
    });

    undoButton.addEventListener('click', function() {
        undoBooks(bookApps.id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.addEventListener('click', function() {
        deletedBooks(bookApps.id);
      });

    if (bookApps.isCompleted) {
        container.append(undoButton, trashButton);
    } else {
        container.append(checkButton, trashButton);
    }

    return container;
};

function booksCompleted (booksId) {
    const target = findBooks(booksId);
    
    if (target == null) return;
    target.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBooks(booksId) {
    for (const item of bookShelf) {
        if (item.id === booksId) {
            return item;
        }
    }
    return null;
}

function deletedBooks(booksId) {
    const deleted = confirm('Hapus buku ini..?');
    
    if (deleted) {    
        const target = findBooksIndex(booksId);
        bookShelf.splice(target, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
}

function undoBooks(booksId) {
    const target = findBooks(booksId);

    if (target == null) return;
    target.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBooksIndex(booksId) {
    for (const index in bookShelf) {
        if (bookShelf[index].id === booksId) {
            return index;
        }
    }
    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(bookShelf);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const SAVED_EVENT = 'saved-books';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() {
    if (typeof (Storage) === 'undefined') {
        alert('Browser anda tidak mendukung local storage');
        return false;
    } 
    return true;
}

document.addEventListener(SAVED_EVENT, function() {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromLocalStorage() {
    const serialezedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serialezedData);

    if (data !== null) {
        for (const item of data) {
            bookShelf.push(item);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}