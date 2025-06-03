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
    borrowed: book[]
}
interface Transactions {
    id: number,
    book: book,
    member: member,
    dateBorrowed: Date,
    dateReturned: Date
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
            dateReturned: new Date()
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

