import React, { Component } from 'react';
import SearchArea from '../components/SearchArea';
import request from 'superagent';
import BookList from '../components/BookList';
import Sidebar from '../components/Sidebar';
import '../style/SearchPage.css';

class SearchBooks extends Component {
    constructor(props) {
        super(props);
        this.state = {
            books: [],
            searchField: '',
            sort: '',
            selectedGenre: 'All genres',
            loading: false,
            isTrending: true
        }
    }

    componentDidMount() {
        // Don't search on initial mount when All genres is selected
        if (this.state.selectedGenre !== 'All genres') {
            this.searchTrendingBooks(this.state.selectedGenre);
        }
    }

    searchTrendingBooks = (genre = null) => {
        // If "All genres" is selected, just clear the books and return
        if (!genre || genre === 'All genres') {
            this.setState({ 
                books: [],
                loading: false,
                isTrending: true
            });
            return;
        }

        this.setState({ loading: true, isTrending: true });
        
        // Calculate date range for trending books (last 5 years)
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 5;
        
        request
            .get("https://www.googleapis.com/books/v1/volumes")
            .query({ 
                q: `subject:${genre}`,
                orderBy: 'newest',
                maxResults: 40
            })
            .then((data) => {
                if (!data.body.items) {
                    this.setState({ 
                        books: [],
                        loading: false 
                    });
                    return;
                }
                
                // Filter for recent books
                const filteredBooks = data.body.items.filter(book => {
                    const publishYear = parseInt(book.volumeInfo.publishedDate?.substring(0,4));
                    return publishYear >= startYear && publishYear <= currentYear;
                });

                const cleanData = this.cleanData({ body: { items: filteredBooks } });
                this.setState({ 
                    books: cleanData,
                    loading: false
                });
            })
            .catch(err => {
                console.error('Search error:', err);
                alert("An error occurred while searching for books. Please try again.");
                this.setState({ loading: false });
            });
    }

    searchBook = (e) => {
        e.preventDefault();
        
        // If search field is empty and genre is All genres, don't search
        if (!this.state.searchField.trim() && this.state.selectedGenre === 'All genres') {
            this.setState({ 
                books: [],
                loading: false,
                isTrending: true
            });
            return;
        }

        this.performSearch();
        this.setState({ searchField: '', isTrending: false });
    }

    performSearch = () => {
        this.setState({ loading: true });

        let searchQuery = this.state.searchField.trim();
        
        // Only add genre to query if it's not "All genres"
        if (this.state.selectedGenre !== 'All genres') {
            searchQuery = searchQuery ? 
                `${searchQuery} subject:${this.state.selectedGenre}` : 
                `subject:${this.state.selectedGenre}`;
        }

        // If no search query, don't perform search
        if (!searchQuery) {
            this.setState({ 
                books: [],
                loading: false,
                isTrending: true
            });
            return;
        }

        request
            .get("https://www.googleapis.com/books/v1/volumes")
            .query({ 
                q: searchQuery,
                maxResults: 40 
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
                    loading: false,
                    isTrending: false
                });
            })
            .catch(err => {
                console.error('Search error:', err);
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
            if (genre === 'All genres') {
                // Clear books when "All genres" is selected
                this.setState({
                    books: [],
                    isTrending: true
                });
            } else {
                // Show trending books for the selected genre
                this.searchTrendingBooks(genre);
            }
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
                    {this.state.loading ? (
                        <div className="loading">
                            <div className="loading-spinner"></div>
                            <p>Searching for books...</p>
                        </div>
                    ) : (
                        <BookList books={sortedBooks} />
                    )}
                </div>
            </div>
        );
    }
}

export default SearchBooks;
