import React, { FC } from 'react'
import { Redirect, Switch } from 'react-router'
import { Route, BrowserRouter } from 'react-router-dom'

import ErrorBoundary from './errorBoundary'
import AppContainer from './appContainer'
import routerConfigs from '../constants/routerConfig'
import { RouterItemType } from '../types/types'
import GlobalStyle from './globalStyle'

import { Layout, Menu } from 'antd'
import { DatabaseOutlined, ToolOutlined } from '@ant-design/icons'
const { SubMenu } = Menu
const { Content, Sider } = Layout

const App: FC = () => {
  return (
    <>
      <Layout>
        {/* <Header className='header'>
          <Menu theme='dark' mode='horizontal' defaultSelectedKeys={['2']}>
            <Menu.Item key='1'>nav 1</Menu.Item>
            <Menu.Item key='2'>nav 2</Menu.Item>
            <Menu.Item key='3'>nav 3</Menu.Item>
          </Menu>
        </Header> */}
        <Layout>
          <Sider width={200} className='site-layout-background'>
            <Menu
              mode='inline'
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              style={{ height: '100%', borderRight: 0 }}
            >
              <SubMenu key='sub1' icon={<DatabaseOutlined />} title='WT-SERVER'>
                <Menu.Item key='1'>Find Logs</Menu.Item>
              </SubMenu>
            </Menu>
          </Sider>
          <Layout style={{ padding: '0 24px 24px' }}>
            <Content
              className='site-layout-background'
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
                height: '95vh',
                overflow: 'hidden'
              }}
            >
              <GlobalStyle />
              <ErrorBoundary>
                <BrowserRouter>
                  <AppContainer>
                    <Switch>
                      <Redirect exact={true} from='/' to='/home' />
                      {routerConfigs.map((item: RouterItemType, index: number) => {
                        return <Route exact={true} path={`/${item.router}`} component={item.component} key={index} />
                      })}
                    </Switch>
                  </AppContainer>
                </BrowserRouter>
              </ErrorBoundary>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </>
  )
}

export default App
