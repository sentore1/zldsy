-- Function to update inventory quantity
CREATE OR REPLACE FUNCTION update_inventory_quantity(
  p_inventory_id UUID,
  p_quantity_change DECIMAL(10, 2)
)
RETURNS void AS $$
BEGIN
  UPDATE inventory
  SET quantity = quantity + p_quantity_change,
      updated_at = NOW()
  WHERE id = p_inventory_id;
END;
$$ LANGUAGE plpgsql;
