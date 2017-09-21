/* */
import React from 'react'

/* */
import styles from './Home.scss'
import NavBar from 'component/NavBar/'
import MainScreen from 'component/MainScreen/'
import Intro  from 'component/Intro/'
import Library  from 'component/Library/'
import ProjectList  from 'component/ProjectList/'
import Join from '../Join/Join'
class Home extends React.Component {

    constructor() {
        super();
        this.state = {isLogIn: false};

        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    handleLogin = () => {
        this.setState({isLogIn : true});
    };
    handleLogout = () => {
        this.setState({isLogIn:false});
    };

    renderPage() {
        if(this.state.isLogIn) {
            return <ProjectList />
        }
        else{
            return <MainScreen />
        }
    }
    render() {
        return (
            <div className={styles.wrapper}>
               <NavBar />
               <Intro />
                {this.renderPage()}
               <Library />
            </div>
        )
    }
}

export default Home
