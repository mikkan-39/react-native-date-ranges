import React, { Component } from "react";
import { View, TouchableHighlight, Modal, Text } from "react-native";
import PropTypes from "prop-types";
import DateRange from "./DateRange";
import moment from "moment";
import normalize from "./normalizeText";

const styles = {
  placeholderText: {
    color: "#c9c9c9",
    fontSize: normalize(18),
  },
  contentInput: {
    alignItems: "center",
    justifyContent: "center",
  },
  contentText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "bold",
  },
  stylish: {
    height: 48,
    borderColor: "#bdbdbd",
    borderWidth: 2,
    borderRadius: 32,
  },
};
export default class ComposePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      allowPointerEvents: true,
      showContent: false,
      selected: "",
      startDate: null,
      endDate: null,
      date: new Date(),
      focus: "startDate",
      currentDate: moment(),
      textStartDate: "-",
      textEndDate: "-",
    };
  }
  isDateBlocked = (date) => {
    if (this.props.blockBefore) {
      return date.isBefore(moment(), "day");
    } else if (this.props.blockAfter) {
      return date.isAfter(moment(), "day");
    }
    return false;
  };
  onDatesChange = (event) => {
    const { startDate, endDate, focusedInput, currentDate } = event;
    if (currentDate) {
      this.setState({ currentDate });
      return;
    }
    if (
      this.props.maxDate &&
      (new Date(endDate) > new Date(this.props.maxDate) ||
        new Date(startDate) > new Date(this.props.maxDate))
    ) {
      alert("Ошибка", "Выберите правильную дату");
      return;
    }
    if (
      this.props.minDate &&
      new Date(startDate) < new Date(this.props.minDate)
    ) {
      alert("Ошибка", "Выберите правильную дату");
      return;
    }
    this.setState({ ...this.state, focus: focusedInput }, () => {
      this.setState({ ...this.state, startDate, endDate });
    });
  };
  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  };
  onCancel = () => {
    this.setModalVisible(false);
  };
  onConfirm = () => {
    const returnFormat = this.props.returnFormat || "YYYY/MM/DD";
    const outFormat = this.props.outFormat || "LL";
    if (!this.props.mode || this.props.mode === "single") {
      this.setState({
        showContent: true,
        selected: new Date(this.state.currentDate)
          .toLocaleString("ru-RU")
          .slice(0, 8),
      });
      this.setModalVisible(false);
      if (typeof this.props.onConfirm === "function") {
        this.props.onConfirm({
          currentDate: this.state.currentDate.format(returnFormat),
        });
      }
      return;
    }

    if (this.state.startDate && this.state.endDate) {
      const start = new Date(this.state.startDate)
        .toLocaleString("ru-RU")
        .slice(0, 8);
      const end = new Date(this.state.endDate)
        .toLocaleString("ru-RU")
        .slice(0, 8);
      this.setState({
        showContent: true,
        selected: `${start} ${this.props.dateSplitter} ${end}`,
      });
      this.setModalVisible(false);

      if (typeof this.props.onConfirm === "function") {
        this.props.onConfirm({
          startDate: this.state.startDate.format(returnFormat),
          endDate: this.state.endDate.format(returnFormat),
        });
      }
    } else {
      alert("Внимание", "Пожалуйста, выберите промежуток времени.");
    }
  };
  getTitleElement() {
    const { placeholder, customStyles = {}, allowFontScaling } = this.props;
    const showContent = this.state.showContent;
    if (!showContent && placeholder) {
      return (
        <Text
          allowFontScaling={allowFontScaling}
          style={[styles.placeholderText, customStyles.placeholderText]}
        >
          {placeholder}
        </Text>
      );
    }
    return (
      <Text
        allowFontScaling={allowFontScaling}
        style={[styles.contentText, customStyles.contentText]}
      >
        {this.state.selected}
      </Text>
    );
  }

  renderButton = () => {
    const { customButton } = this.props;

    if (customButton) {
      return customButton(this.onConfirm);
    }
    return (
      <TouchableHighlight
        underlayColor={"transparent"}
        onPress={this.onConfirm}
        style={[
          { width: "40%", marginHorizontal: "2%" },
          this.props.ButtonStyle,
        ]}
      >
        <Text
          style={[
            { fontSize: 20, textAlign: "right" },
            this.props.ButtonTextStyle,
          ]}
        >
          {this.props.ButtonText ? this.props.ButtonText : "OK"}
        </Text>
      </TouchableHighlight>
    );
  };

  renderCancelButton = () => {
    return (
      <TouchableHighlight
        underlayColor={"transparent"}
        onPress={this.onCancel}
        style={[
          { width: "40%", marginHorizontal: "2%" },
          this.props.ButtonStyle,
        ]}
      >
        <Text
          style={[
            { fontSize: 20, textAlign: "left" },
            this.props.ButtonTextStyle,
          ]}
        >
          Отмена
        </Text>
      </TouchableHighlight>
    );
  };

  render() {
    const { customStyles = {} } = this.props;

    let style = styles.stylish;
    style = this.props.centerAlign ? { ...style } : style;
    style = { ...style, ...this.props.style };

    return (
      <TouchableHighlight
        underlayColor={"transparent"}
        onPress={() => {
          this.setModalVisible(true);
        }}
        style={[{ height: "100%", justifyContent: "center" }, style]}
      >
        <View>
          <View>
            <View style={[customStyles.contentInput, styles.contentInput]}>
              {this.getTitleElement()}
            </View>
          </View>
          <Modal
            animationType="slide"
            onRequestClose={() => this.setModalVisible(false)}
            transparent={false}
            visible={this.state.modalVisible}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "column",
                backgroundColor: this.props.calendarBgColor,
              }}
            >
              <View style={{ height: "90%" }}>
                <DateRange
                  headFormat={this.props.headFormat}
                  customStyles={customStyles}
                  markText={this.props.markText}
                  onDatesChange={this.onDatesChange}
                  isDateBlocked={this.isDateBlocked}
                  startDate={this.state.startDate}
                  endDate={this.state.endDate}
                  focusedInput={this.state.focus}
                  calendarBgColor={this.props.calendarBgColor || undefined}
                  selectedBgColor={this.props.selectedBgColor || undefined}
                  selectedTextColor={this.props.selectedTextColor || undefined}
                  mode={this.props.mode || "single"}
                  currentDate={this.state.currentDate}
                  textStartDate={this.state.textStartDate}
                  textEndDate={this.state.textEndDate}
                />
              </View>
              <View
                style={{
                  paddingBottom: "5%",
                  width: "100%",
                  height: "10%",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {this.renderCancelButton()}
                {this.renderButton()}
              </View>
            </View>
          </Modal>
        </View>
      </TouchableHighlight>
    );
  }
}

ComposePicker.propTypes = {
  dateSplitter: PropTypes.string,
};

ComposePicker.defaultProps = { dateSplitter: "->" };
