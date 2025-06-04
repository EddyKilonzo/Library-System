interface book {
    id: number,
    title: string,
    author: string,
    year: number,
    borrowed: boolean
}
interface member {
    id: number,
    name: string,
    email: string,
    phone: string,
    borrowed: book[]
}
interface Transactions {
    id: number,
    book: book,
    member: member,
    dateBorrowed: Date,
    dateReturned: Date | null,
    status: 'borrowed' | 'returned'
}

class LibraryService {
    books: book[] = [];
    members: member[] = [];
    transactions: Transactions[] = [];


    //book section
    addBook(book: book ): book {
        const bookId = this.books.length + 1;
        this.books.push(book);
        return book;
    }

    getBooks(): book[] {
        return this.books

    }

    updateBook(book: book): book {
        const index = this.books.findIndex(b => b.id === book.id);
        if (index === -1) {
            throw new Error('Book not found');
        } else {
            this.books[index].title = book.title;
            this.books[index] = { ...this.books[index], author: book.author };
            this.books[index].year = book.year;
            this.books[index].borrowed = book.borrowed;
        }
        return this.books[index];
    }

    deleteBook(book: book): book {
        const index = this.books.findIndex(b => b.id === book.id); 
        if (index === -1) {
            throw new Error('Book not found');
        } else {
            this.books.splice(index, 1);
        }
        
        return book;
    }

    //members 

    addMember(member: member): member {
        const memberId = this.members.length + 1;
        this.members.push(member);
        return member;
    }

    getMembers(): member[] {
        return this.members;
    }

    updateMember(member: member): member {
        const index = this.members.findIndex(m => m.id === member.id);
        if(index === -1) {
            throw new Error("Member not found!");
        } else {
            this.members[index] = member;
        }
        return member;
    }
    deleteMember(member: member): member {
        const index = this.members.findIndex(m => m.id === member.id);
        if(index === -1) {
            throw new Error("Member not found!");
        } else {
            this.members.splice(index, 1);
        }
        return member;
    }

    private renderBooks() {
        const booksList = document.querySelector('.books-list') as HTMLUListElement;
        booksList.innerHTML = ''; 
        this.books.forEach(book => {
            const bookItem = document.createElement('li');
            bookItem.innerHTML = `
                <i class="fa-solid fa-book"></i>
                <p>${book.title}</p>
                <p>${book.author}</p>
                <p>${book.year}</p>
                <div class="icons">
                    <i class="fa-solid fa-pen" data-id="${book.id}"></i>
                    <i class="fa-solid fa-trash" data-id="${book.id}"></i>
                </div>
            `;
            booksList.appendChild(bookItem);
        });
    }

    //transactions

    transactionService(book: book, member: member): Transactions {
        if (!this.members.length) {
            throw new Error("No members found");
        } else if (!this.books.length) {
            throw new Error("No books found");
        }
        
        const availableBooks = this.books.filter(book => !book.borrowed);
        if (availableBooks.length === 0) {
            throw new Error("No books available for borrowing");
        }

        const transaction: Transactions = {
            id: this.transactions.length + 1,
            book: book,
            member: member,
            dateBorrowed: new Date(),
            dateReturned: null,
            status: 'borrowed'
        };
        
        this.transactions.push(transaction);
        book.borrowed = true;
        return transaction;
    }

    returnBook(transactionsId: number): boolean {
        const transaction = this.transactions.find(t => t.id === transactionsId);

        if (transaction && !transaction.dateReturned) {
            transaction.dateReturned = new Date();
            const book = this.books.find(b => b.id === transaction.book.id);
            if(book) {
                book.borrowed = false;
                return true;
            }
            return false;
        }
        return false;
    }

    getTransactions(): Transactions[] {
        return this.transactions;
    }

    getActiveTransactions(): Transactions[] {
        return this.transactions.filter(t => t.dateReturned === null);
    }
}


class UiService {
    private editingMemberId: number | null = null;
    private editingBookId: number | null = null;
    
    constructor (private libraryService: LibraryService) {

        this.setupEventListeners();
        this.renderMembers();
        this.renderBooks();
        this.renderTransactions();
        this.updateBorrowDropdowns();
    }

    private setupEventListeners() {
        const memberForm = document.getElementById('add-member-form') as HTMLFormElement;
        

        memberForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = (document.getElementById('name') as HTMLInputElement).value;
            const email = (document.getElementById('email') as HTMLInputElement).value;
            const phone = (document.getElementById('phone') as HTMLInputElement).value;
            

            if(this.editingMemberId) {
                const updatedMember: member = {
                    id: this.editingMemberId,
                    name: name,
                    email: email,
                    phone: phone,
                    borrowed: []
                };
                this.libraryService.updateMember(updatedMember);
                this.editingMemberId = null;

                const submitButton = memberForm.querySelector('button[type="submit"]') as HTMLButtonElement;
                submitButton.textContent = 'Add Member';


            } else {
                const newMember: member = {
                    id: Date.now(),
                    name: name,
                    email: email,
                    phone: phone,
                    borrowed: []
                };
                this.libraryService.addMember(newMember);
            }
            memberForm.reset();
            this.renderMembers();
            this.updateBorrowDropdowns();
        });
        document.querySelector('.members-list')?.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;

            if (target.classList.contains('fa-pen')) {
                const memberId = parseInt(target.getAttribute('data-id') || '0');
                const member = this.libraryService.members.find(m => m.id === memberId);
                if(member) {
                    this.editingMemberId = member.id;
                    (document.getElementById('name') as HTMLInputElement).value = member.name;
                    (document.getElementById('email') as HTMLInputElement).value = member.email;
                    (document.getElementById('phone') as HTMLInputElement).value = member.phone;
                    const submitButton = memberForm.querySelector('button[type="submit"]') as HTMLButtonElement;
                    submitButton.textContent = 'Update Member';
                }
            } else if (target.classList.contains('fa-trash')) {
                const memberId = parseInt(target.getAttribute('data-id') || '0');
                const memberToDelete = this.libraryService.members.find(m => m.id === memberId);
                if (memberToDelete) {
                    if (confirm('Are you sure you want to delete this member?')) {
                        this.libraryService.deleteMember(memberToDelete);
                        this.renderMembers();
                        this.updateBorrowDropdowns();
                    }
                } else {
                    alert('Member not found!');
                }
                
            }
        })


        const bookForm = document.getElementById('add-book-form') as HTMLFormElement;
        bookForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const title = (document.getElementById('title') as HTMLInputElement).value;
            const author = (document.getElementById('author') as HTMLInputElement).value;
            const year = (document.getElementById('year') as HTMLInputElement).value;

            if(this.editingBookId) {
                const updatedBook: book = {
                    id: this.editingBookId,
                    title: title,
                    author: author,
                    year: parseInt(year),
                    borrowed: false
                };
                this.libraryService.updateBook(updatedBook);
                this.editingBookId = null;

                const submitButton = bookForm.querySelector('button[type="submit"]') as HTMLButtonElement;
                submitButton.textContent = 'Add Book';
            } else {
                const newBook: book = {
                    id: Date.now(),
                    title: title,
                    author: author,
                    year: parseInt(year),
                    borrowed: false
                };
                this.libraryService.addBook(newBook);
            }
            bookForm.reset();
            this.renderBooks();
            this.updateBorrowDropdowns();

        });

    document.querySelector('.books-list')?.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;

        if (target.classList.contains('fa-pen')) {
            const bookId = parseInt(target.getAttribute('data-id') || '0');
            const book = this.libraryService.books.find(b => b.id === bookId);
            try {
                if(book) {
                    this.editingBookId = book.id;
                    (document.getElementById('title') as HTMLInputElement).value = book.title;
                    (document.getElementById('author') as HTMLInputElement).value = book.author;
                    (document.getElementById('year') as HTMLInputElement).value = book.year.toString();
                    const submitButton = bookForm.querySelector('button[type="submit"]') as HTMLButtonElement;
                    submitButton.textContent = 'Update Book';
                }
            } catch (error) {
                alert('error updating book');
            }

        } else if (target.classList.contains('fa-trash')) {

            const bookId = parseInt(target.getAttribute('data-id') || '0');
            const bookToDelete = this.libraryService.books.find(b => b.id === bookId);
            if (bookToDelete) {
                const isBookBorrowed = this.libraryService.transactions.some(t => t.book.id === bookId && t.status === 'borrowed');

                if (isBookBorrowed) {
                    alert('This book is currently borrowed and cannot be deleted.');
                    return;

                } 

                if (confirm('Are you sure you want to delete this book?')) {
                    this.libraryService.deleteBook(bookToDelete);
                    this.renderBooks();
                    this.updateBorrowDropdowns();
                }
            }
            
        }
    });

        const borrowForm = document.getElementById('borrow-form') as HTMLFormElement;
        borrowForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const borrowMember = (document.getElementById('borrow-member') as HTMLSelectElement).value;
            const borrowBook = (document.getElementById('borrow-book') as HTMLSelectElement).value;
            const returnDate = (document.getElementById('return-date') as HTMLInputElement).value;

            if(!borrowMember || !borrowBook || !returnDate) {
                alert('Please fill in all the required fields.');
                return;
            }

            const member = this.libraryService.members.find(m => m.id === parseInt(borrowMember));
            const book = this.libraryService.books.find(b => b.id === parseInt(borrowBook));

            if (member && book) {
            try {
                const transaction = {
                    id: Date.now(),
                    book,
                    member,
                    dateBorrowed: new Date(),
                    dateReturned: new Date(returnDate),
                    status: 'borrowed'
                };
                
                this.libraryService.transactionService(book, member);
                this.renderTransactions();
                this.updateBorrowDropdowns();
                borrowForm.reset();
                
                
                const returnDateInput = document.getElementById('return-date') as HTMLInputElement;
                returnDateInput.min = new Date().toISOString().split('T')[0];
            } catch (error) {
                // alert(error.message);
            }
        }
        });

        
    }
      

    private renderMembers() {
        const membersList = document.querySelector('.members-list') as HTMLUListElement;
        membersList.innerHTML = ''; 

        this.libraryService.members.forEach(member => {
            const memberItem = document.createElement('li');
            memberItem.innerHTML = `
                <i class="fa-solid fa-user"></i>
                <p>${member.name}</p> 
                <p>${member.email}</p>
                <p>${member.phone}</p>
                <div class="icons">
                    <i id="edit-user-button" class="fa-solid fa-pen" data-id="${member.id}"></i>
                    <i id="delete-user-button" class="fa-solid fa-trash" data-id="${member.id}"></i>
                </div>
            `;
            membersList.appendChild(memberItem);
        });
    }
    private renderBooks() {
        const booksList = document.querySelector('.books-list') as HTMLUListElement;
        booksList.innerHTML = ''; 
        this.libraryService.books.forEach(book => {
            const bookItem = document.createElement('li');
            bookItem.innerHTML = `
                <i class="fa-solid fa-book"></i>
                <p>${book.title}</p>
                <p>${book.author}</p>
                <p>${book.year}</p>
                <div class="icons">
                    <i class="fa-solid fa-pen" data-id="${book.id}"></i>
                    <i class="fa-solid fa-trash" data-id="${book.id}"></i>
                </div>
            `;
            booksList.appendChild(bookItem);
        });
    }

    private renderTransactions() {
        const transactionTable = document.getElementById('Transaction-table') as HTMLTableElement;
        const tbody = document.createElement('tbody');
    
        
        if (transactionTable.querySelector('tbody')) {
            transactionTable.querySelector('tbody')?.remove();
        }
    
        this.libraryService.transactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            
            const borrowDate = new Date(transaction.dateBorrowed).toLocaleDateString();
            const returnDate = transaction.dateReturned ? 
                new Date(transaction.dateReturned).toLocaleDateString() : 
                'Not returned';
            
            // Set status based on return date
            const statusClass = transaction.status === 'returned' ? 'status-returned' : 'status-borrowed';
            const status = transaction.status === 'returned' ? 'Returned' : 'Borrowed'; 

            
    
            row.innerHTML = `
                <td>${transaction.book.id}</td>
                <td>${transaction.book.title}</td>
                <td>${transaction.member.name}</td>
                <td>${borrowDate}</td>
                <td>${returnDate}</td>
                <td class="${statusClass}">${status}</td>
            `;
    
            tbody.appendChild(row);
        });
    
        transactionTable.appendChild(tbody);
    }
    public updateBorrowDropdowns() {
        const borrowMemberSelect = document.getElementById('borrow-member') as HTMLSelectElement;
        const borrowBookSelect = document.getElementById('borrow-book') as HTMLSelectElement;
    
        borrowMemberSelect.innerHTML = '<option value="">Select Member</option>';
        borrowBookSelect.innerHTML = '<option value="">Select Book</option>';
    
        this.libraryService.getMembers().forEach(member => {
            const option = document.createElement('option');
            option.value = member.id.toString();
            option.textContent = member.name;
            borrowMemberSelect.appendChild(option);
        });
    
        this.libraryService.getBooks().forEach(book => {
            const option = document.createElement('option');
            option.value = book.id.toString();
            option.textContent = book.title;
            borrowBookSelect.appendChild(option);
        });
    }
    
}
const libraryService = new LibraryService();
new UiService(libraryService);
    



