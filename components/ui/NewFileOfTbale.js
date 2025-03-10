import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import Collapsible from "react-native-collapsible";

const { width } = Dimensions.get("window");

const TableApp = ({ DATA }) => {
  const [expandedRows, setExpandedRows] = useState({});
  const scrollViewRefs = useRef([]);
  const [scrollHandlerIds, setScrollHandlerIds] = useState([]);
  const detailScrollRefs = useRef(new Set()); // Store all detail row refs

  useEffect(() => {
    const ids = DATA.map((item) => item.id);
    setScrollHandlerIds(ids);
  }, []);

  const toggleExpand = (id) => {
    setExpandedRows((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const handleScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    scrollViewRefs.current.forEach((scrollView, index) => {
      if (scrollView) {
        scrollView.scrollTo({ x: scrollX, animated: false });
      }
    });
  };

  const handleDetailScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    detailScrollRefs.current.forEach((scrollView) => {
      if (scrollView) {
        scrollView.scrollTo({ x: scrollX, animated: false });
      }
    });
  };

  const renderItem = ({ item, index }) => (
    <>
      <View
        style={[
          styles.row,
          item.id === DATA.length.toString() && styles.mainRow,
        ]}
      >
        {typeof item.details == "string" && item.details !== "" ? (
          <TouchableOpacity
            onPress={() => toggleExpand(item.id)}
            style={styles.frozenColumn}
          >
            <Text style={styles.text}>
              {item.name}
              {expandedRows[item.id]
                ? String.fromCharCode(8595)
                : String.fromCharCode(8593)}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.frozenColumn}>
            <Text style={styles.text}>{item.name}</Text>
          </View>
        )}

        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={item.id === DATA.length.toString()}
          style={styles.scrollableRow}
          ref={(el) => (scrollViewRefs.current[index] = el)}
          onScroll={scrollHandlerIds.includes(item.id) ? handleScroll : null}
          scrollEventThrottle={16}
        >
          <View style={styles.otherColumns}>
            {item.otherColumns.map((col, colIndex) => (
              <View key={colIndex}>
                {col === "A3" || col === "C4" ? (
                  <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                    <Text style={styles.text}>
                      {col}{" "}
                      {expandedRows[item.id]
                        ? " " + String.fromCharCode(8595)
                        : " " + String.fromCharCode(8593)}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.text}>{col}</Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <Collapsible collapsed={!expandedRows[item.id]}>
        {typeof item.details !== "string" ? (
          <>
            {" "}
            {item.details.map((detail, detailIndex) => (
              <View key={detailIndex} style={styles.row}>
                <View style={styles.frozenColumnPlaceholder} />

                <ScrollView
                  horizontal
                  style={styles.scrollableRow}
                  showsHorizontalScrollIndicator={
                    detailIndex === item.details.length - 1
                  }
                  ref={(el) => {
                    if (el && !detailScrollRefs.current.has(el)) {
                      detailScrollRefs.current.add(el); // Add ref to Set
                    }
                  }}
                  onScroll={handleDetailScroll}
                  scrollEventThrottle={16}
                >
                  <View style={styles.otherColumns}>
                    {item.otherColumns.map((_, colIndex) => (
                      <Text key={colIndex} style={styles.text}>
                        {colIndex === 0 ? detail.value : "-"}
                      </Text>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.accordionContainer}>
            <View style={styles.frozenColumnAccordion}>
              <Text style={styles.detailsText}>Details</Text>
            </View>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={true}
              style={styles.scrollableDetails}
              ref={(el) => (scrollViewRefs.current[index + DATA.length] = el)}
            >
              <View style={styles.detailRow}>
                <Text style={styles.detailsText}>{item.details}</Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Collapsible>
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
      <Text style={styles.totalText}>Total</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: Platform.OS === "web" ? "white" : "black",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    position: "relative",
    flex: 1,
    height: "100%", // Set fixed height for each row
  },

  frozenColumn: {
    width: width < 600 ? width * 0.35 : 155,
    backgroundColor: Platform.OS === "web" ? "white" : "black",
    padding: 0,
    justifyContent: "center",
    zIndex: 1,
    height: "100%", // Ensure the column height matches the row height
  },
  mainRow: {
    zIndex: 2,
  },
  scrollableRow: {
    marginLeft: Platform.OS === "web" ? 0 : 11, // Adjust margin for web app
    flex: 1,
    zIndex: 1,
    height: "100%", // Ensure the scrollable row height matches the row height
  },
  otherColumns: {
    flexDirection: "row",
  },
  text: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1, // if no need of border then border can be 0
    borderColor: "#555",
    color: Platform.OS === "web" ? "black" : "white",
    fontWeight: "400",
    minWidth: 155,
    //  textAlign: "center",
    height: "100%", // Ensure the text height matches the column height
    lineHeight: 30, // Vertically center text
  },
  accordionContainer: {
    flexDirection: "row",
    marginTop: 5,
    zIndex: 0,
  },
  frozenColumnAccordion: {
    width: width < 600 ? width * 0.35 : 155,
    backgroundColor: Platform.OS === "web" ? "white" : "black",
    padding: 10,
    position: "absolute",
    left: 0,
    justifyContent: "center",
    zIndex: 1,
  },
  scrollableDetails: {
    marginLeft: width < 600 ? width * 0.4 : 170,
    flex: 1,
    zIndex: 0,
  },
  detailsRow: {
    backgroundColor: "#555",
    padding: 10,
    flexDirection: "row",
    minWidth: 620,
    borderWidth: 1,
    borderColor: "#555",
  },
  detailColumn: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 155,
    borderWidth: 1,
    borderColor: "#555",
  },
  detailsText: {
    fontSize: 14,
    color: Platform.OS === "web" ? "black" : "white",
    textAlign: "center",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    color: Platform.OS === "web" ? "black" : "white",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%", // Match main row height
    backgroundColor: Platform.OS === "web" ? "white" : "black", // Match main row color
    borderBottomWidth: 1,
    borderColor: "#555", // Same as main row
  },
  frozenColumnPlaceholder: {
    width: width < 600 ? width * 0.35 : 155, // Same width as frozenColumn
    backgroundColor: "transparent", // Hide it visually
  },
});

export default TableApp;
