import onnx
model = onnx.load("meeperomi_general.onnx")
for i in model.graph.input:
    print(f"Input: {i.name}, Shape: {[d.dim_value for d in i.type.tensor_type.shape.dim]}")
for o in model.graph.output:
    print(f"Output: {o.name}, Shape: {[d.dim_value for d in o.type.tensor_type.shape.dim]}")
