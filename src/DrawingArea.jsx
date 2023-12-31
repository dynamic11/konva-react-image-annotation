import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import ScanImage from "./ScanImage";
import HighlightArea from "./HighlightArea";
import ZoneBox from "./ZoneBox";

import InfoModal from "./InfoModal";
import remove from "lodash/remove";
import uniqueId from "lodash/uniqueId";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";

import Box from "@mui/material/Box";

import Grid from "@mui/material/Grid";

import ShapeTable from "./ShapeTable";
import DrawTools from "./DrawTools";

const CANVAS_DIM = 500;

const RectangleDrawing = () => {
  const stageRef = useRef(null);
  const [rectangles, setRectangles] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [selectedShape, setSelectedShape] = useState(null);
  const [drawTool, setDrawTool] = React.useState("area");

  const handleToolChange = (event) => {
    setDrawTool(event.target.value);
  };

  const handleCloseModal = () => {
    setSelectedShape(null);
  };

  const handleDeleteZone = (idToDelete) => {
    const cleanedRectangles = rectangles;
    remove(cleanedRectangles, { id: idToDelete });
    setSelectedShape(cleanedRectangles);
    setSelectedShape(null);
  };

  const handleMouseDown = (e) => {
    if (isDrawingEnabled) {
      const { offsetX, offsetY } = e.evt;
      setStartPos({ x: offsetX, y: offsetY });
      setDrawing(true);
    }
  };

  const handleMouseUp = (e) => {
    if (!drawing) return;

    setDrawing(false);
    const { offsetX, offsetY } = e.evt;
    const width = offsetX - startPos.x;
    const height = offsetY - startPos.y;
    if (Math.abs(width) > 2 && Math.abs(height) > 2) {
      const newRectangles = [...rectangles];
      newRectangles.push({
        id: uniqueId(),
        x: startPos.x,
        y: startPos.y,
        width,
        height,
      });
      setRectangles(newRectangles);
    }
  };

  const handleMouseMove = (e) => {
    const stage = stageRef.current;
    const mousePos = stage.getPointerPosition();
    if (mousePos) {
      setCurrentPos({ x: mousePos.x, y: mousePos.y });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setDrawing(false);
    }
  };

  const onZoneClick = (data) => {
    setDrawing(false);
    setSelectedShape(data);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleDrawToggle = (event) => {
    setIsDrawingEnabled(event.target.checked);
    setStartPos({});
  };

  return (
    <Box sx={{ py: 1 }}>
      <h1>Image annotation tool</h1>
      <Grid container spacing={2}>
        <Grid item xs={8} sx={{ textAlign: "center" }}>
          <Paper
            sx={{
              backgroundColor: "#2A2727",
              py: 3,
              position: "relative",
              height: "auto",
            }}
            elevation={3}
          >
            <Paper
              elevation={3}
              sx={{
                mx: "auto",
                maxWidth: "fit-content",
              }}
            >
              <Stage
                width={CANVAS_DIM}
                height={CANVAS_DIM}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                ref={stageRef}
              >
                <Layer>
                  <ScanImage
                    src="https://images.pexels.com/photos/16514723/pexels-photo-16514723/free-photo-of-photo-of-colored-sewing-threads.jpeg"
                    x={0}
                    y={0}
                    width={CANVAS_DIM}
                    height={CANVAS_DIM}
                  />
                </Layer>
                <Layer>
                  {/* Draw rectangles */}
                  {rectangles.map((rect, index) => (
                    <ZoneBox
                      key={index}
                      shape={rect}
                      onClick={onZoneClick}
                      isSelected={
                        selectedShape && selectedShape.dataId === index
                      }
                    />
                  ))}
                  {/* Draw highlighted area on mouse drag */}
                  {drawing && (
                    <HighlightArea
                      x={startPos.x}
                      y={startPos.y}
                      width={currentPos.x - startPos.x}
                      height={currentPos.y - startPos.y}
                    />
                  )}
                </Layer>
              </Stage>
            </Paper>
          </Paper>
        </Grid>

        <Grid item xs={4}>
          <Stack spacing={2}>
            <DrawTools
              onDrawToggle={handleDrawToggle}
              isDrawing={isDrawingEnabled}
              onClear={() => setRectables([])}
              selectedDrawTool={drawTool}
              onToolSelect={handleToolChange}
            />
            <ShapeTable data={rectangles} />
          </Stack>
        </Grid>
      </Grid>
      {selectedShape && (
        <InfoModal
          data={selectedShape}
          isOpen={!!selectedShape}
          handleCloseModal={handleCloseModal}
          xPosition={selectedShape.x + selectedShape.width + 20}
          yPosition={selectedShape.y}
          onDeleteZone={handleDeleteZone}
        />
      )}
    </Box>
  );
};

export default RectangleDrawing;
