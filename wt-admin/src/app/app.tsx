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
              <SubMenu key='sub1' icon={<DatabaseOutlined />} title='天眼日志'>
                <Menu.Item key='1'>日志查询</Menu.Item>
                {/* <Menu.Item key='2'>option2</Menu.Item>
                <Menu.Item key='3'>option3</Menu.Item>
                <Menu.Item key='4'>option4</Menu.Item> */}
              </SubMenu>
              {/* <SubMenu key="sub2" icon={<ToolOutlined />} title="实用工具">
                <Menu.Item key="5">KV配置</Menu.Item>
                <Menu.Item key="6">产品信息</Menu.Item>
              </SubMenu> */}
              {/* <SubMenu key='sub3' icon={<NotificationOutlined />} title=''>
                <Menu.Item key='9'>option9</Menu.Item>
                <Menu.Item key='10'>option10</Menu.Item>
                <Menu.Item key='11'>option11</Menu.Item>
                <Menu.Item key='12'>option12</Menu.Item>
              </SubMenu> */}
            </Menu>
          </Sider>
          <Layout style={{ padding: '0 24px 24px' }}>
            {/* <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>List</Breadcrumb.Item>
              <Breadcrumb.Item>App</Breadcrumb.Item>
            </Breadcrumb> */}
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
