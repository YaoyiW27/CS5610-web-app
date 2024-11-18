import React, { Component } from 'react';
import SearchArea from '../components/SearchArea';
import request from 'superagent';
import BookList from '../components/BookList';
import Sidebar from '../components/Sidebar';
class SearchBooks extends Component {
    constructor(props) {
        super(props);
        this.state = {
            books: [],
            searchField: '',
            sort: '',
            selectedGenre: 'All genres',
            loading: false,
            isTrending: true // New state to track if showing trending books
        }
    }

    componentDidMount() {
        this.searchTrendingBooks();
    }

    // New method to get trending books
    searchTrendingBooks = (genre = null) => {
        this.setState({ loading: true, isTrending: true });

        // Calculate date range for trending books (last 5 years)
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 5;
        
        // Build query for trending books
        let queryString = `${startYear}..${currentYear}`; // Date range for Google Books API

        // Add genre if specified
        if (genre && genre !== 'All genres') {
            queryString += ` subject:${genre}`;
        }

        request
            .get("https://www.googleapis.com/books/v1/volumes")
            .query({ 
                q: queryString,
                orderBy: 'newest',
                maxResults: 40 // Get more results to filter
            })
            .then((data) => {
                if (!data.body.items) {
                    this.setState({ 
                        books: [],
                        loading: false 
                    });
                    return;
                }
                const cleanData = this.cleanData(data);
                this.setState({ 
                    books: cleanData,
                    loading: false
                });
            })
            .catch(err => {
                alert("An error occurred while searching for books. Please try again.");
                this.setState({ loading: false });
            });
    }

    searchBook = (e) => {
        e.preventDefault();
        
        if (!this.state.searchField.trim()) {
            alert("Please enter a search term");
            return;
        }

        this.performSearch();
        this.setState({ searchField: '', isTrending: false });
    }

    performSearch = () => {
        this.setState({ loading: true });

        let queryString = this.state.searchField.trim();
        
        if (this.state.selectedGenre !== 'All genres' && queryString) {
            queryString = `${queryString} subject:${this.state.selectedGenre}`;
        } else if (this.state.selectedGenre !== 'All genres' && !queryString) {
            queryString = `subject:${this.state.selectedGenre}`;
        }

        request
            .get("https://www.googleapis.com/books/v1/volumes")
            .query({ q: queryString })
            .then((data) => {
                if (!data.body.items) {
                    alert("No books found matching your criteria");
                    this.setState({ loading: false });
                    return;
                }
                const cleanData = this.cleanData(data);
                this.setState({ 
                    books: cleanData,
                    loading: false,
                    isTrending: false
                });
            })
            .catch(err => {
                alert("An error occurred while searching for books. Please try again.");
                this.setState({ loading: false });
            });
    }

    handleSearch = (e) => {
        this.setState({ searchField: e.target.value });
    }

    handleSort = (e) => {
        this.setState({ sort: e.target.value });
    }

    handleGenreSelect = (genre) => {
        this.setState({ selectedGenre: genre }, () => {
            // Always show trending books when changing genres
            this.searchTrendingBooks(genre);
        });
    }

    cleanData = (data) => {
        const cleanedData = data.body.items.map((book) => {
            if(book.volumeInfo.hasOwnProperty('publishedDate') === false) {
                book.volumeInfo['publishedDate'] = '0000';
            }
            else if(book.volumeInfo.hasOwnProperty('imageLinks') === false) {
                book.volumeInfo['imageLinks'] = { thumbnail: '/placeholder-book.png' };
            }
            return book;
        });
        return cleanedData;
    }

    render() {
        const sortedBooks = this.state.books.sort((a, b) => {
            if(this.state.sort === 'Newest') {
                return parseInt(b.volumeInfo.publishedDate.substring(0, 4)) - parseInt(a.volumeInfo.publishedDate.substring(0, 4));
            }
            else if(this.state.sort === 'Oldest') {
                return parseInt(a.volumeInfo.publishedDate.substring(0, 4)) - parseInt(b.volumeInfo.publishedDate.substring(0, 4));
            }
            return 0;
        });
        
        return (
            <div className="main-container">
                <Sidebar 
                    onGenreSelect={this.handleGenreSelect} 
                    selectedGenre={this.state.selectedGenre} 
                />
                <div className="content-area">
                    <div className="sticky-search">
                        <SearchArea 
                            searchBook={this.searchBook} 
                            handleSearch={this.handleSearch} 
                            handleSort={this.handleSort}
                            selectedGenre={this.state.selectedGenre}
                            searchField={this.state.searchField}
                        />
                    </div>
                    {this.state.isTrending && (
                        <h1 className="trending-title">Trending</h1>
                    )}
                    {this.state.loading && (
                        <div className="loading">
                            <div className="loading-spinner"></div>
                            <p>Searching for books...</p>
                        </div>
                    )}
                    {!this.state.loading && (
                        <BookList books={sortedBooks} />
                    )}
                </div>
            </div>
        );
    }
}

export default SearchBooks;
