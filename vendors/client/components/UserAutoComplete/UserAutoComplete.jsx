import { Autocomplete, Checkbox, TextField } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
//
import { Select } from "antd";
import request from "@/service/request.js";
import PropTypes from "prop-types";
import React, { PureComponent as Component, useEffect, useState } from "react";
/**
 * 用户名输入框自动完成组件
 *
 * @component UsernameAutoComplete
 * @examplelanguage js
 *
 * * 用户名输入框自动完成组件
 * * 用户名输入框自动完成组件
 *
 *s
 */
/**
 * 获取自动输入的用户信息
 *
 * 获取子组件state
 * @property callbackState
 * @type function
 * @description 类型提示：支持数组传值；也支持用函数格式化字符串：函数有两个参数(scale, index)；
 * 受控属性：滑块滑到某一刻度时所展示的刻度文本信息。如果不需要标签，请将该属性设置为 [] 空列表来覆盖默认转换函数。
 * @returns {object} {uid: xxx, username: xxx}
 * @examplelanguage js
 * @example
 * onUserSelect(childState) {
 *   this.setState({
 *     uid: childState.uid,
 *     username: childState.username
 *   })
 * }
 *
 */
class UserAutoComplete extends Component {
  constructor(props) {
    super(props);
    // this.lastFetchId = 0;
    // this.fetchUser = debounce(this.fetchUser, 800);
  }
  state = {
    dataSource: [],
    fetching: false
  };
  static propTypes = {
    callbackState: PropTypes.func
  };
  // 搜索回调
  handleSearch = (value) => {
    const params = { q: value };
    // this.lastFetchId += 1;
    // const fetchId = this.lastFetchId;
    this.setState({ fetching: true });
    request.get("/user/search", { params }).then((data) => {
      // if (fetchId !== this.lastFetchId) { // for fetch callback order
      //   return;
      // }
      const userList = [];
      data = data.data.data;
      if (data) {
        data.forEach((v) =>
          userList.push({
            username: v.username,
            id: v.uid
          })
        );
        // 取回搜索值后，设置 dataSource
        this.setState({
          dataSource: userList
        });
      }
    });
  };
  // 选中候选词时
  handleChange = (value) => {
    this.setState({
      dataSource: [],
      // value,
      fetching: false
    });
    this.props.callbackState(value);
  };
  render() {
    let { dataSource, fetching } = this.state;
    const children = dataSource.map((item, index) => (
      <Select.Option key={index} value={"" + item.id}>
        {item.username}
      </Select.Option>
    ));
    // if (!children.length) {
    //   fetching = false;
    // }
    return (
      <Select
        mode="multiple"
        style={{ width: "100%" }}
        placeholder="请输入用户名"
        filterOption={false}
        optionLabelProp="children"
        notFoundContent={fetching ? <span style={{ color: "red" }}> 当前用户不存在</span> : null}
        onSearch={this.handleSearch}
        onChange={this.handleChange}>
        {children}
      </Select>
    );
  }
}
const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;
function UserAutoCompleteMain(props) {
  const { onChange, value, name, label, placeholder } = props;
  //
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState([]);
  const [options, setOptions] = useState([]);
  const loading = open && options.length === 0;
  // 搜索回调
  const handleSearch = async(value) => {
    const response = await request.get("/user/search", { params: { q: value } });
    const data = response.data.data;
    if (data) {
      return data.map((v) => ({ ...v, title: v.username, username: v.username, id: v.uid, value: v.uid }));
    } else {
      return []
    }
  };
  //
  const _onChange = (event, newValue) => {
    console.log(event, newValue);
    setSelection(newValue)
    onChange(event, newValue.map((e) => e.value));
  }
  const _onInput = async(e) => {
    console.log(e.nativeEvent.data);
    const list = await handleSearch(e.nativeEvent.data);
    setOptions(list);
  }
  //
  return (
    <Autocomplete multiple limitTags={2}
      name={name}
      options={options}
      getOptionLabel={(option) => option.title}
      defaultValue={value}
      loading={loading}
      disableCloseOnSelect
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected}/>
          {option.title}
        </li>
      )}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder={placeholder} onChange={_onInput}/>
      )}
      sx={{ width: "auto" }}
      value={selection}
      onChange={_onChange}
    />
  )
}
export default UserAutoCompleteMain;
