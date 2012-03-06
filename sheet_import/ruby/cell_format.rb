class String
  def cell_to_array
    self.split(',').map{|f| f.strip }
  end
  
  def cell_to_string
    self.strip
  end
  
  def cell_to_date
    arr = self.split('/').map{|x| x.to_i }
    
    if arr.size == 3 && arr[2].is_a?( Integer )
      Date.new arr[2], arr[0], arr[1]
    else
      nil
    end
    
  end
  
  def cell_to_float
    self.to_f
  end
  
end

