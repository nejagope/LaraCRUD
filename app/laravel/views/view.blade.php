@extends('layouts.admin.main')

@section('title')
 - admin view %TableSingularName%
@endsection('title')

@section('head')
@stop

@section('links')
| <a href="{{ route('%RoutePrefix%_%TableName%_index')}}">&lt;&lt; Back to %TableName% </a>
@stop

@section('content')

<div class="container">
   
    <hr>

    <div class="panel panel-primary">                                
            
        <div class="panel-heading">                    
            <h4>View %TableSingularName%</h4><hr>
        </div>

        <div class="panel-body">     
        
            <div class="row">        
                <div class="col-md-6">        
                    <table class="table table-responsive">
                        %Fields%
                    </table>                    
                </div>

                <div class="col-md-6">
                    %AssociationsSections%
                </div>
            </div>
        </div>        
    </div>

</div>
@stop