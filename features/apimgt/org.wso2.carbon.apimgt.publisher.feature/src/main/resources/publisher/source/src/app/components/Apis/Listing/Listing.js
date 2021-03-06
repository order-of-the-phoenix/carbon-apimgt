/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react'
import qs from 'qs'

import ApiThumb from './ApiThumb'
import '../Apis.css'
import API from '../../../data/api.js'
import Loading from '../../Base/Loading/Loading'
import ResourceNotFound from "../../Base/Errors/ResourceNotFound";
import {Link} from 'react-router-dom'
import {Col, Menu, Row, Table} from 'antd';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import SampleAPI from './SampleAPI';
import NotificationSystem from 'react-notification-system';
import IconButton from 'material-ui/IconButton';
import List from 'material-ui-icons/List';
import GridIcon from 'material-ui-icons/GridOn';
import { Manager, Target } from 'react-popper';
import AddNewMenu from './AddNewMenu'


import {ScopeValidation ,resourceMethod, resourcePath} from "../../../data/ScopeValidation";
const styles = theme => ({
    rightIcon: {
        marginLeft: theme.spacing.unit
    },
    button: {
        margin: theme.spacing.unit,
        marginBottom: 20
    },
    titleBar: {
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: 'solid 2px #ddd'
    },
    buttonLeft: {
        alignSelf: 'flex-start',
        display: 'flex',
    },
    buttonRight: {
        alignSelf: 'flex-end',
        display: 'flex',
    },
    title: {
        display: 'inline-block',
        marginRight: 50
    },
    addButton: {
        display: 'inline-block',
        marginBottom: 20,
        zIndex: 1,
    },
    popperClose: {
        pointerEvents: 'none',
    }
});
const menu = (
    <Menu>
        <Link to="/api/create/swagger">
            <Menu.Item>Create new API with Swagger</Menu.Item>
        </Link>
        <Link to="/api/create/rest">
            <Menu.Item>Create new API</Menu.Item>
        </Link>
    </Menu>
);
const ButtonGroup = Button.Group;
class Listing extends React.Component {
    constructor(props) {
        super(props);
        this.state = {listType: 'grid', apis: null, newMenuOpen: false };
        this.handleApiDelete = this.handleApiDelete.bind(this);
        this.updateApi = this.updateApi.bind(this);
    }

    componentDidMount() {
        let api = new API();
        let promised_apis = api.getAll();
        promised_apis.then((response) => {
            this.setState({apis: response.obj});
        }).catch(error => {
            if (process.env.NODE_ENV !== "production")
                console.log(error);
            let status = error.status;
            if (status === 404) {
                this.setState({notFound: true});
            } else if (status === 401) {
                this.setState({isAuthorize: false});
                let params = qs.stringify({reference: this.props.location.pathname});
                this.props.history.push({pathname: "/login", search: params});
            }
        });
    }

    setListType = (value) => {
        this.setState({listType: value});
    }

    updateApi(api_uuid){
        let api = this.state.apis;
        for (let apiIndex in api.list) {
            if (api.list.hasOwnProperty(apiIndex) && api.list[apiIndex].id === api_uuid) {
                api.list.splice(apiIndex, 1);
                break;
            }
        }
        this.setState({apis: api});
    }

    handleApiDelete(api_uuid, name) {
        this.refs.notificationSystem.addNotification( {
            message: 'Deleting the API ...', position: 'tc', level: 'success', autoDismiss: 1
        });
        const api = new API();
        let promised_delete = api.deleteAPI(api_uuid);
        promised_delete.then(
            response => {
                if (response.status !== 200) {
                    console.log(response);
                    this.refs.notificationSystem.addNotification( {
                        message: 'Something went wrong while deleting the ' + name + ' API!', position: 'tc',
                        level: 'error'
                    });
                    return;
                }
                this.refs.notificationSystem.addNotification( {
                    message: name + ' API deleted Successfully', position: 'tc', level: 'success'
                });
                let api = this.state.apis;
                for (let apiIndex in api.list) {
                    if (api.list.hasOwnProperty(apiIndex) && api.list[apiIndex].id === api_uuid) {
                        api.list.splice(apiIndex, 1);
                        break;
                    }
                }
                this.setState({active: false, apis: api});
            }
        );
    }
    handleClickNew = () => {
        this.setState({newMenuOpen:true});
    }
    handleCloseNew = () => {
        this.setState({newMenuOpen:false});
    }
    render() {
        const classes = this.props.classes;
        const {apis} = this.state;
        if (this.state.notFound) {
            return <ResourceNotFound/>
        }
        const columns = [{
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => <Link to={"/apis/" + record.id}>{text}</Link>,
        }, {
            title: 'Context',
            dataIndex: 'context',
            key: 'context',
        }, {

            title: 'Version',
            dataIndex: 'version',
            key: 'version',
        }, {
            title: 'Action',
            key: 'action',
            render: (record) => <ScopeValidation resourcePath={resourcePath.SINGLE_API}
                                                 resourceMethod={resourceMethod.DELETE}>
                <Button style={{fontSize: 10, padding: "0px", margin: "0px"}} color="primary"
                        onClick={() => this.handleApiDelete(record.id, record.name)}>
                    Delete
                </Button></ScopeValidation>
        }];
        if (!apis) {
            return (<Loading/>);
        } else if (apis.count === 0) {
            return (<SampleAPI/>);
        } else {
            return (
                <Grid container spacing={0} justify="center">
                    <Grid item xs={12} className={classes.titleBar}>
                        <div className={classes.buttonLeft}>
                            <div className={classes.title}>
                                <Typography variant="display2" gutterBottom>
                                    APIs
                                </Typography>
                            </div>
                            <AddNewMenu />
                            {/*<Manager className={classes.addButton}>
                                <Target>
                                    <Button
                                        aria-owns={this.state.newMenuOpen ? 'menu-list' : null}
                                        aria-haspopup="true"
                                        onClick={this.handleClickNew}
                                        variant="raised" color="secondary"
                                    >
                                        Create
                                        <ArrowDropDownCircle className={classes.rightIcon} />
                                    </Button>
                                </Target>
                                <Popper
                                    placement="bottom-start"
                                    eventsEnabled={this.state.newMenuOpen}
                                    className={classNames({ [classes.popperClose]: !this.state.newMenuOpen })}
                                >
                                    <ClickAwayListener onClickAway={this.handleCloseNew}>
                                        <Grow in={this.state.newMenuOpen} id="menu-list" style={{ transformOrigin: '0 0 0' }}>
                                            <Paper>
                                                <MenuList role="menu">
                                                    <Link to="/api/create/rest">
                                                        <MenuItem onClick={this.handleClose}>Rest</MenuItem>
                                                    </Link>
                                                    <Link to="/api/create/swagger">
                                                        <MenuItem onClick={this.handleClose}>Rest - Swagger</MenuItem>
                                                    </Link>
                                                    <Link to="/api/create/wsdl">
                                                        <MenuItem onClick={this.handleClose}>SOAP - WSDL</MenuItem>
                                                    </Link>
                                                    <Link to="/api/create/rest">
                                                        <MenuItem onClick={this.handleClose}>WebSocket</MenuItem>
                                                    </Link>
                                                </MenuList>
                                            </Paper>
                                        </Grow>
                                    </ClickAwayListener>
                                </Popper>
                            </Manager>*/}

                        </div>
                        <div className={classes.buttonRight}>
                            <IconButton className={classes.button} aria-label="Delete" onClick={() => this.setListType('list')}>
                                <List />
                            </IconButton>
                            <IconButton className={classes.button} aria-label="Delete" onClick={() => this.setListType('grid')}>
                                <GridIcon />
                            </IconButton>
                        </div>
                    </Grid>
                    <Grid item ex={12}>

                    </Grid>
                    <Grid item xs={12}>
                        {this.state.listType === "list" ?
                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <Table columns={columns} dataSource={this.state.apis.list} bordered
                                           locale={{ emptyText:'There is no data to display' }}/>
                                    <NotificationSystem ref="notificationSystem"/>
                                </Col>
                            </Row>
                            : <Grid container spacing={0}>
                                {this.state.apis.list.map((api, i) => {
                                    return <ApiThumb key={api.id} listType={this.state.listType} api={api}
                                                     updateApi={this.updateApi}/>
                                })}
                            </Grid>
                        }
                    </Grid>
                </Grid>
            );
        }
    }
}


Listing.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Listing);