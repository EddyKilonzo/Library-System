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
            book.id = this.books[index].id;
            book.title = this.books[index].title;
            book.author = this.books[index].author;
            book.year = this.books[index].year;
            book.borrowed = this.books[index].borrowed;
            
        }
        return book
        
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
            throw new Error("Memeber not found!");
        } else {
            member.id = this.members[index].id;
            member.name = this.members[index].name;
            member.email = this.members[index].email;
            member.borrowed = this.members[index].borrowed;
        }
        return member;
    }

    deleteMember(member: member):member {
        const index = this.members.findIndex(m => m.id === member.id);

        if(index === -1) {
            throw new Error ("Mmeber not found!");
        } else {
            this.members.splice(index, 1);

        }
        return member;
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

            const member: member = {
                id: Date.now(),
                name: name,
                email: email,
                phone: phone,
                borrowed: []
            };
            this.libraryService.addMember(member);
            this.renderMembers();
            this.updateBorrowDropdowns();
            memberForm.reset();
        });


        const bookForm = document.getElementById('add-book-form') as HTMLFormElement;
        bookForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const title = (document.getElementById('title') as HTMLInputElement).value;
            const author = (document.getElementById('author') as HTMLInputElement).value;
            const year = (document.getElementById('year') as HTMLInputElement).value;

            const book: book = {
                id: Date.now(),
                title: title,
                author: author,
                year: parseInt(year),
                borrowed: false
            };
            this.libraryService.addBook(book);
            this.renderBooks();
            this.updateBorrowDropdowns();
            bookForm.reset();
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
            `;
            membersList.appendChild(memberItem);
        });
    }
    private renderBooks() {
        const booksList = document.querySelector('.books-list') as HTMLUListElement;
        booksList.innerHTML = ''; // Clear existing content
        this.libraryService.books.forEach(book => {
            const bookItem = document.createElement('li');
            bookItem.innerHTML = `
                <i class="fa-solid fa-book"></i>
                <p>${book.title}</p>
                <p>${book.author}</p>
                <p>${book.year}</p>
            `;
            booksList.appendChild(bookItem);
        });
    }

    private renderTransactions() {
        const transactionTable = document.getElementById('Transaction-table') as HTMLTableElement;
        const tbody = document.createElement('tbody');
    
        // Clear existing table content
        if (transactionTable.querySelector('tbody')) {
            transactionTable.querySelector('tbody')?.remove();
        }
    
        this.libraryService.transactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            // Format dates
            const borrowDate = new Date(transaction.dateBorrowed).toLocaleDateString();
            const returnDate = transaction.dateReturned ? 
                new Date(transaction.dateReturned).toLocaleDateString() : 
                'Not returned';
            
            // Set status based on return date
            const statusClass = transaction.status === 'returned' ? 'status-returned' : 'status-borrowed';
            const status = transaction.status === 'returned' ? 'Returned' : 'Borrowed'; 

            const actionButton = transaction.status === 'borrowed' ? 
            `<button class="return-button" onclick="handleReturn(${transaction.id})">Return</button>` : 
            '';
    
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
    private updateBorrowDropdowns() {
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
    



